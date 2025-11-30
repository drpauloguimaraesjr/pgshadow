import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { PlaudClient } from "../integrations/plaud";
import { getDb } from "../db";
import { knowledgeEntries, promptTemplates } from "../schema";
import { invokeLLM } from "../_core/llm";
import { eq } from "drizzle-orm";

export const plaudRouter = router({
    // Test connection with Plaud Note
    testConnection: protectedProcedure
        .input(z.object({
            clientId: z.string(),
            secretKey: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                const client = new PlaudClient(input);
                const devices = await client.getDevices();
                return {
                    success: true,
                    devices: devices.length,
                    message: `Connected successfully! Found ${devices.length} device(s).`
                };
            } catch (error: any) {
                return {
                    success: false,
                    message: error.message
                };
            }
        }),

    // List files from Plaud Note
    listFiles: protectedProcedure
        .input(z.object({
            clientId: z.string(),
            secretKey: z.string(),
            deviceId: z.string().optional(),
        }))
        .query(async ({ input }) => {
            const client = new PlaudClient({
                clientId: input.clientId,
                secretKey: input.secretKey,
            });
            return await client.getFiles(input.deviceId);
        }),

    // Import a specific file from Plaud Note
    importFile: protectedProcedure
        .input(z.object({
            clientId: z.string(),
            secretKey: z.string(),
            fileId: z.string(),
            templateId: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const client = new PlaudClient({
                clientId: input.clientId,
                secretKey: input.secretKey,
            });

            const file = await client.getFile(input.fileId);

            if (!file.transcription?.text) {
                throw new Error("File has no transcription available");
            }

            const text = file.transcription.text;
            const db = await getDb();
            if (!db) throw new Error("Database not available");

            // Detect if it's an English class
            const isEnglishClass = /\b(english|inglês|lesson|teacher|student|vocabulary|grammar)\b/i.test(file.name) ||
                /\b(english|inglês|lesson|teacher|student)\b/i.test(text.substring(0, 500));

            let systemPrompt: string;

            if (input.templateId) {
                // Use specified template
                const [template] = await db
                    .select()
                    .from(promptTemplates)
                    .where(eq(promptTemplates.id, input.templateId))
                    .limit(1);

                if (!template) throw new Error("Template not found");
                systemPrompt = template.systemPrompt;
            } else if (isEnglishClass) {
                // Skip processing for English classes
                await db.insert(knowledgeEntries).values({
                    question: `Aula de Inglês: ${file.name}`,
                    answer: text,
                    category: "English",
                    sourceType: "transcription",
                    sourceFile: `plaud:${file.name}`,
                    userId: ctx.user.id,
                }).returning();

                return {
                    success: true,
                    entriesCreated: 1,
                    fileName: file.name,
                    skipped: true,
                    reason: "English class - saved as-is"
                };
            } else {
                // Use default medical consultation prompt
                systemPrompt = `Você é um assistente especializado em extrair informações de consultas médicas.
Analise a transcrição fornecida e extraia pares de pergunta-resposta relevantes.
Foque em:
- Sintomas relatados pelo paciente
- Diagnósticos dados pelo médico
- Tratamentos e medicações prescritas
- Orientações e recomendações
- Exames solicitados

Retorne um JSON com o seguinte formato:
{
  "entries": [
    {
      "question": "Pergunta ou tópico principal",
      "answer": "Resposta detalhada ou informação relevante",
      "category": "Categoria médica (ex: Cardiologia, Pediatria, etc)"
    }
  ]
}`;
            }

            // Use LLM to extract Q&A pairs
            const llmResponse = await invokeLLM({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "qa_extraction",
                        strict: true,
                        schema: {
                            type: "object",
                            properties: {
                                entries: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            question: { type: "string" },
                                            answer: { type: "string" },
                                            category: { type: "string" }
                                        },
                                        required: ["question", "answer"],
                                        additionalProperties: false
                                    }
                                }
                            },
                            required: ["entries"],
                            additionalProperties: false
                        }
                    }
                }
            });

            const extracted = JSON.parse(llmResponse.choices[0].message.content);

            let count = 0;
            for (const entry of extracted.entries) {
                await db.insert(knowledgeEntries).values({
                    question: entry.question,
                    answer: entry.answer,
                    category: entry.category || null,
                    sourceType: "transcription",
                    sourceFile: `plaud:${file.name}`,
                    userId: ctx.user.id,
                }).returning();
                count++;
            }

            return {
                success: true,
                entriesCreated: count,
                fileName: file.name,
                skipped: false
            };
        }),
});
