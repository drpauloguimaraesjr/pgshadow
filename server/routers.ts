import { COOKIE_NAME } from "../../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";

import { apiKeysRouter } from "./routers/apiKeys";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  apiKeys: apiKeysRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Knowledge Base Management
  knowledge: router({
    list: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        active: z.boolean().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getKnowledgeEntries(ctx.user.id, input);
      }),

    search: protectedProcedure
      .input(z.object({
        query: z.string(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.searchKnowledgeEntries(ctx.user.id, input.query, input.limit);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getKnowledgeEntryById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        question: z.string(),
        answer: z.string(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        sourceType: z.enum(["manual", "transcription", "import", "api"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const entry = {
          ...input,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          userId: ctx.user.id,
          sourceType: input.sourceType || "manual" as const,
        };
        return await db.createKnowledgeEntry(entry);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        question: z.string().optional(),
        answer: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        const updateData: any = { ...updates };
        if (updates.tags) {
          updateData.tags = JSON.stringify(updates.tags);
        }
        return await db.updateKnowledgeEntry(id, ctx.user.id, updateData);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteKnowledgeEntry(input.id, ctx.user.id);
      }),
  }),

  categories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCategories(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createCategory({
          ...input,
          userId: ctx.user.id,
        });
      }),
  }),

  transcriptions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTranscriptions(ctx.user.id);
    }),

    upload: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(),
        fileSize: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `transcriptions/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, 'text/plain');

        const result = await db.createTranscription({
          fileName: input.fileName,
          fileUrl: url,
          fileSize: input.fileSize,
          userId: ctx.user.id,
          status: "pending",
        });

        return { success: true, url, transcriptionId: result[0].id };
      }),

    process: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const transcription = await db.getTranscriptionById(input.id, ctx.user.id);
        if (!transcription) throw new Error("Transcription not found");

        await db.updateTranscription(input.id, ctx.user.id, { status: "processing" });

        try {
          const response = await fetch(transcription.fileUrl);
          const text = await response.text();

          const llmResponse = await invokeLLM({
            messages: [
              { role: "system", content: `Extraia pares de pergunta-resposta de transcrições. Retorne JSON: {"entries": [{"question": "...", "answer": "...", "category": "..."}]}` },
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
            await db.createKnowledgeEntry({
              question: entry.question,
              answer: entry.answer,
              category: entry.category || null,
              sourceType: "transcription",
              sourceFile: transcription.fileUrl,
              userId: ctx.user.id,
            });
            count++;
          }

          await db.updateTranscription(input.id, ctx.user.id, {
            status: "completed",
            processedText: text,
            entriesExtracted: count,
            processedAt: new Date(),
          });

          return { success: true, entriesExtracted: count };
        } catch (error: any) {
          await db.updateTranscription(input.id, ctx.user.id, { status: "failed", errorMessage: error.message });
          throw error;
        }
      }),
  }),

  api: router({
    search: publicProcedure
      .input(z.object({ query: z.string(), userId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.searchKnowledgeEntries(input.userId, input.query, input.limit);
      }),

    addEntry: publicProcedure
      .input(z.object({
        userId: z.number(),
        question: z.string(),
        answer: z.string(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createKnowledgeEntry({
          ...input,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          sourceType: "api" as const,
        });
      }),

    processEmail: publicProcedure
      .input(z.object({ userId: z.number(), subject: z.string(), body: z.string(), from: z.string() }))
      .mutation(async ({ input }) => {
        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: `Extraia conhecimento de emails. Retorne JSON: {"entries": [{"question": "...", "answer": "...", "category": "..."}]}` },
            { role: "user", content: `Assunto: ${input.subject}\n\nDe: ${input.from}\n\n${input.body}` }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "email_extraction",
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
          await db.createKnowledgeEntry({
            question: entry.question,
            answer: entry.answer,
            category: entry.category || "email",
            sourceType: "api",
            sourceFile: `email:${input.from}`,
            userId: input.userId,
          });
          count++;
        }

        return { success: true, entriesAdded: count };
      }),
  }),
});

export type AppRouter = typeof appRouter;
