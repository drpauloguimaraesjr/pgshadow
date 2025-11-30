import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, knowledgeEntries, InsertKnowledgeEntry, categories, InsertCategory, transcriptions, InsertTranscription } from "./schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL);
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// KNOWLEDGE BASE QUERIES
// ============================================

export async function createKnowledgeEntry(entry: InsertKnowledgeEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(knowledgeEntries).values(entry).returning();
  return result;
}

export async function getKnowledgeEntries(userId: number, options?: {
  category?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [eq(knowledgeEntries.userId, userId)];

  if (options?.category) {
    conditions.push(eq(knowledgeEntries.category, options.category));
  }

  if (options?.active !== undefined) {
    conditions.push(eq(knowledgeEntries.active, options.active));
  }

  let query = db.select().from(knowledgeEntries)
    .where(and(...conditions))
    .orderBy(desc(knowledgeEntries.createdAt));

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.offset(options.offset);
  }

  return await query;
}

export async function searchKnowledgeEntries(userId: number, searchQuery: string, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const searchPattern = `%${searchQuery}%`;

  return await db.select().from(knowledgeEntries)
    .where(
      and(
        eq(knowledgeEntries.userId, userId),
        eq(knowledgeEntries.active, true),
        sql`(${knowledgeEntries.question} LIKE ${searchPattern} OR ${knowledgeEntries.answer} LIKE ${searchPattern})`
      )
    )
    .orderBy(desc(knowledgeEntries.createdAt))
    .limit(limit);
}

export async function updateKnowledgeEntry(id: number, userId: number, updates: Partial<InsertKnowledgeEntry>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(knowledgeEntries)
    .set(updates)
    .where(and(
      eq(knowledgeEntries.id, id),
      eq(knowledgeEntries.userId, userId)
    ));
}

export async function deleteKnowledgeEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(knowledgeEntries)
    .set({ active: false })
    .where(and(
      eq(knowledgeEntries.id, id),
      eq(knowledgeEntries.userId, userId)
    ));
}

export async function getKnowledgeEntryById(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(knowledgeEntries)
    .where(and(
      eq(knowledgeEntries.id, id),
      eq(knowledgeEntries.userId, userId)
    ))
    .limit(1);

  return result[0];
}

// ============================================
// CATEGORIES QUERIES
// ============================================

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(categories).values(category).returning();
}

export async function getCategories(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name);
}

// ============================================
// TRANSCRIPTIONS QUERIES
// ============================================

export async function createTranscription(transcription: InsertTranscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(transcriptions).values(transcription).returning();
}

export async function getTranscriptions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(transcriptions)
    .where(eq(transcriptions.userId, userId))
    .orderBy(desc(transcriptions.createdAt));
}

export async function updateTranscription(id: number, userId: number, updates: Partial<InsertTranscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(transcriptions)
    .set(updates)
    .where(and(
      eq(transcriptions.id, id),
      eq(transcriptions.userId, userId)
    ));
}

export async function getTranscriptionById(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(transcriptions)
    .where(and(
      eq(transcriptions.id, id),
      eq(transcriptions.userId, userId)
    ))
    .limit(1);

  return result[0];
}
