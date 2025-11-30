import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { PlaudClient } from "../integrations/plaud";
import { getDb } from "../db";
import { knowledgeEntries } from "../schema";
import { invokeLLM } from "../_core/llm";

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

            // Use LLM to extract Q&A pairs
            const llmResponse = await invokeLLM({
                messages: [
                    {
                        role: "system",
                        content: `Extract question-answer pairs from medical consultations. Return JSON: {"entries": [{"question": "...", "answer": "...", "category": "..."}]}`
                    },
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
            const db = await getDb();
            if (!db) throw new Error("Database not available");

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
                fileName: file.name
            };
        }),
});
