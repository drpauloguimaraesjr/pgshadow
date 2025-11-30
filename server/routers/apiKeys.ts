import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { apiKeys } from "../schema";
import { getDb } from "../db";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export const apiKeysRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        return await db
            .select()
            .from(apiKeys)
            .where(eq(apiKeys.userId, ctx.user.id))
            .orderBy(desc(apiKeys.createdAt));
    }),

    create: protectedProcedure
        .input(z.object({ name: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db) throw new Error("Database not available");

            // Generate a random key
            const rawKey = `sk_${crypto.randomBytes(24).toString("hex")}`;

            // Hash it for storage
            const keyHash = crypto
                .createHash("sha256")
                .update(rawKey)
                .digest("hex");

            const prefix = rawKey.substring(0, 7);

            await db.insert(apiKeys).values({
                userId: ctx.user.id,
                name: input.name,
                keyHash,
                prefix,
            });

            // Return the raw key ONLY ONCE
            return { key: rawKey };
        }),

    revoke: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db) throw new Error("Database not available");

            await db
                .delete(apiKeys)
                .where(eq(apiKeys.id, input.id));
        }),
});
