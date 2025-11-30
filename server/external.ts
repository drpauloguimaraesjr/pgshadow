import express from "express";
import crypto from "crypto";
import { getDb } from "./db";
import { apiKeys, knowledgeEntries } from "./schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// Middleware to validate API Key
const validateApiKey = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const apiKey = req.header("X-API-KEY");

    if (!apiKey) {
        return res.status(401).json({ error: "Missing X-API-KEY header" });
    }

    try {
        const db = await getDb();
        if (!db) return res.status(503).json({ error: "Database unavailable" });

        // Hash the provided key to compare with stored hash
        const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

        const [keyRecord] = await db
            .select()
            .from(apiKeys)
            .where(eq(apiKeys.keyHash, keyHash))
            .limit(1);

        if (!keyRecord || !keyRecord.active) {
            return res.status(403).json({ error: "Invalid or inactive API Key" });
        }

        // Attach user info to request for use in route
        (req as any).apiUser = { id: keyRecord.userId };

        // Update last used timestamp (fire and forget)
        db.update(apiKeys)
            .set({ lastUsedAt: new Date() })
            .where(eq(apiKeys.id, keyRecord.id))
            .catch(console.error);

        next();
    } catch (error) {
        console.error("API Key validation error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

router.use(express.json());

/**
 * POST /api/external/ingest
 * Ingest knowledge entries from external systems (like n8n)
 */
router.post("/ingest", validateApiKey, async (req, res) => {
    try {
        const { question, answer, category, tags, source } = req.body;
        const userId = (req as any).apiUser.id;

        if (!question || !answer) {
            return res.status(400).json({ error: "Missing required fields: question, answer" });
        }

        const db = await getDb();
        if (!db) return res.status(503).json({ error: "Database unavailable" });

        const [entry] = await db.insert(knowledgeEntries).values({
            question,
            answer,
            category: category || null,
            tags: tags ? JSON.stringify(tags) : null,
            sourceType: "api",
            sourceFile: source || "n8n-webhook",
            userId,
        }).returning();

        res.json({
            success: true,
            id: entry.id,
            message: "Knowledge entry created successfully"
        });

    } catch (error: any) {
        console.error("Ingest error:", error);
        res.status(500).json({ error: error.message });
    }
});

export const externalRouter = router;
