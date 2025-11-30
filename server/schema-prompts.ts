import { pgTable, serial, text, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";

/**
 * Prompt templates for processing different types of transcriptions
 */
export const promptTemplates = pgTable("prompt_templates", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    systemPrompt: text("system_prompt").notNull(),
    category: varchar("category", { length: 50 }), // 'medical', 'english', 'general', etc
    isDefault: boolean("is_default").default(false),
    userId: integer("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type InsertPromptTemplate = typeof promptTemplates.$inferInsert;
