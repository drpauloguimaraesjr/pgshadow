import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { promptTemplates } from "../schema";
import { getDb } from "../db";
import { eq, and, desc } from "drizzle-orm";

export const promptTemplatesRouter = router({
    // List all templates for the user
    list: protectedProcedure.query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        return await db
            .select()
            .from(promptTemplates)
            .where(eq(promptTemplates.userId, ctx.user.id))
            .orderBy(desc(promptTemplates.createdAt));
    }),

    // Get a specific template
    get: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db) throw new Error("Database not available");

            const [template] = await db
                .select()
                .from(promptTemplates)
                .where(
                    and(
                        eq(promptTemplates.id, input.id),
                        eq(promptTemplates.userId, ctx.user.id)
                    )
                )
                .limit(1);

            return template;
        }),

    // Create a new template
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                description: z.string().optional(),
                systemPrompt: z.string().min(1),
                category: z.string().optional(),
                isDefault: z.boolean().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db) throw new Error("Database not available");

            // If setting as default, unset other defaults in the same category
            if (input.isDefault && input.category) {
                await db
                    .update(promptTemplates)
                    .set({ isDefault: false })
                    .where(
                        and(
                            eq(promptTemplates.userId, ctx.user.id),
                            eq(promptTemplates.category, input.category)
                        )
                    );
            }

            const [template] = await db
                .insert(promptTemplates)
                .values({
                    ...input,
                    userId: ctx.user.id,
                })
                .returning();

            return template;
        }),

    // Update a template
    update: protectedProcedure
        .input(
            z.object({
                id: z.number(),
                name: z.string().min(1).optional(),
                description: z.string().optional(),
                systemPrompt: z.string().min(1).optional(),
                category: z.string().optional(),
                isDefault: z.boolean().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db) throw new Error("Database not available");

            const { id, ...updates } = input;

            // If setting as default, unset other defaults in the same category
            if (updates.isDefault && updates.category) {
                await db
                    .update(promptTemplates)
                    .set({ isDefault: false })
                    .where(
                        and(
                            eq(promptTemplates.userId, ctx.user.id),
                            eq(promptTemplates.category, updates.category)
                        )
                    );
            }

            const [template] = await db
                .update(promptTemplates)
                .set({ ...updates, updatedAt: new Date() })
                .where(
                    and(
                        eq(promptTemplates.id, id),
                        eq(promptTemplates.userId, ctx.user.id)
                    )
                )
                .returning();

            return template;
        }),

    // Delete a template
    delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db) throw new Error("Database not available");

            await db
                .delete(promptTemplates)
                .where(
                    and(
                        eq(promptTemplates.id, input.id),
                        eq(promptTemplates.userId, ctx.user.id)
                    )
                );

            return { success: true };
        }),

    // Get default template for a category
    getDefault: protectedProcedure
        .input(z.object({ category: z.string() }))
        .query(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db) throw new Error("Database not available");

            const [template] = await db
                .select()
                .from(promptTemplates)
                .where(
                    and(
                        eq(promptTemplates.userId, ctx.user.id),
                        eq(promptTemplates.category, input.category),
                        eq(promptTemplates.isDefault, true)
                    )
                )
                .limit(1);

            return template;
        }),
});
