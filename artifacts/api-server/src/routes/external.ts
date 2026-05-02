import { Router } from "express";
import { db, propertiesTable, apiKeysTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { z } from "zod/v4";

const router = Router();

// ─── API Key Authentication Middleware ────────────────────────────────────────
router.use(async (req, res, next) => {
  const apiKey = req.headers["x-api-key"] as string | undefined;
  if (!apiKey) {
    return res.status(401).json({ error: "Missing X-API-KEY header" });
  }
  const [keyRecord] = await db
    .select()
    .from(apiKeysTable)
    .where(and(eq(apiKeysTable.key, apiKey), eq(apiKeysTable.isActive, true)));
  if (!keyRecord) {
    return res.status(403).json({ error: "Invalid or inactive API key" });
  }
  await db
    .update(apiKeysTable)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeysTable.id, keyRecord.id));
  next();
});

// ─── Zod schema for ingest ────────────────────────────────────────────────────
const ingestSchema = z.object({
  title: z.string().min(3),
  type: z.string().optional().default("appartement"),
  zone: z.string().optional().default("Centre_Ville"),
  address: z.string().optional().default("Tanger, Maroc"),
  surface: z.number().positive().optional(),
  rentAmount: z.number().positive(),
  rooms: z.number().int().positive().optional(),
  photos: z.array(z.string().url()).optional().default([]),
  videoUrl: z.string().optional(),
  contactOwner: z.string().optional(),
  source: z.enum(["whatsapp", "facebook", "avito", "manuel"]).optional().default("whatsapp"),
  description: z.string().optional(),
});

// ─── POST /api/external/ingest ────────────────────────────────────────────────
router.post("/ingest", async (req, res) => {
  try {
    const parsed = ingestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation échouée", details: parsed.error.issues });
    }
    const data = parsed.data;

    const countResult = await db.select().from(propertiesTable);
    const nextRef = `EXT-${String(countResult.length + 1).padStart(4, "0")}`;

    const [property] = await db
      .insert(propertiesTable)
      .values({
        reference: nextRef,
        title: data.title,
        type: data.type,
        zone: data.zone,
        address: data.address,
        surface: data.surface ? String(data.surface) : "0",
        rentAmount: String(data.rentAmount),
        rooms: data.rooms,
        photos: data.photos,
        videoUrl: data.videoUrl,
        contactOwner: data.contactOwner,
        source: data.source,
        isVerified: false,
        status: "disponible",
        description: data.description,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Bien ingéré avec succès — en attente de validation dans Le Radar",
      property: { id: property.id, reference: property.reference, title: property.title },
    });
  } catch (err) {
    req.log.error({ err }, "Error ingesting property");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/external/check ──────────────────────────────────────────────────
router.get("/check", async (req, res) => {
  try {
    const { zone, type, maxRent, minSurface } = req.query;
    let query = db
      .select({
        id: propertiesTable.id,
        reference: propertiesTable.reference,
        title: propertiesTable.title,
        type: propertiesTable.type,
        zone: propertiesTable.zone,
        address: propertiesTable.address,
        surface: propertiesTable.surface,
        rentAmount: propertiesTable.rentAmount,
        rooms: propertiesTable.rooms,
        photos: propertiesTable.photos,
      })
      .from(propertiesTable)
      .where(
        and(
          eq(propertiesTable.status, "disponible"),
          eq(propertiesTable.isVerified, true),
          zone ? eq(propertiesTable.zone, zone as string) : undefined,
          type ? eq(propertiesTable.type, type as string) : undefined,
          maxRent ? lte(propertiesTable.rentAmount, maxRent as string) : undefined,
          minSurface ? gte(propertiesTable.surface, minSurface as string) : undefined,
        )
      );

    const results = await query;
    res.json({
      available: results.length > 0,
      count: results.length,
      properties: results.slice(0, 5),
    });
  } catch (err) {
    req.log.error({ err }, "Error checking properties");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
