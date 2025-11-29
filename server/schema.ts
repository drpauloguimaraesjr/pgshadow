import { pgTable, serial, text, timestamp, varchar, boolean, integer, index } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * PostgreSQL version for Supabase
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Knowledge base entries - stores consultation transcriptions and Q&A pairs
 */
export const knowledgeEntries = pgTable("knowledge_entries", {
  id: serial("id").primaryKey(),

  // Content
  question: text("question").notNull(),
  answer: text("answer").notNull(),

  // Metadata
  category: varchar("category", { length: 100 }),
  tags: text("tags"), // JSON array stored as text

  // Source tracking
  sourceType: varchar("source_type", { length: 20 }).default("manual").notNull(),
  sourceFile: varchar("source_file", { length: 500 }),

  // Ownership
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Status
  active: boolean("active").default(true).notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("idx_knowledge_user").on(table.userId),
  categoryIdx: index("idx_knowledge_category").on(table.category),
  activeIdx: index("idx_knowledge_active").on(table.active),
  createdIdx: index("idx_knowledge_created").on(table.createdAt),
}));

export type KnowledgeEntry = typeof knowledgeEntries.$inferSelect;
export type InsertKnowledgeEntry = typeof knowledgeEntries.$inferInsert;

/**
 * Categories for organizing knowledge entries
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("idx_categories_user").on(table.userId),
}));

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Transcription files uploaded for processing
 */
export const transcriptions = pgTable("transcriptions", {
  id: serial("id").primaryKey(),

  // File info
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileUrl: varchar("file_url", { length: 1000 }).notNull(),
  fileSize: integer("file_size"),

  // Processing
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  processedText: text("processed_text"),
  errorMessage: text("error_message"),

  // Extraction stats
  entriesExtracted: integer("entries_extracted").default(0),

  // Ownership
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
}, (table) => ({
  userIdx: index("idx_transcriptions_user").on(table.userId),
  statusIdx: index("idx_transcriptions_status").on(table.status),
}));

export type Transcription = typeof transcriptions.$inferSelect;
export type InsertTranscription = typeof transcriptions.$inferInsert;