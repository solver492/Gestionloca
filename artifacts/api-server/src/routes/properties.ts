import { Router } from "express";
import { db } from "@workspace/db";
import { propertiesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const propertyBodySchema = z.object({
  title: z.string(),
  type: z.string(),
  zone: z.string(),
  address: z.string(),
  floor: z.coerce.number().optional(),
  surface: z.coerce.number(),
  rooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  rentAmount: z.coerce.number(),
  chargesAmount: z.coerce.number().optional(),
  depositAmount: z.coerce.number().optional(),
  status: z.string().default("disponible"),
  amenities: z.array(z.string()).optional().default([]),
  photos: z.array(z.string()).optional().default([]),
  videoUrl: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  description: z.string().optional(),
});

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { zone, type, status, search } = req.query as Record<string, string>;
    let properties = await db.select().from(propertiesTable).orderBy(sql`${propertiesTable.createdAt} DESC`);

    if (zone) properties = properties.filter((p) => p.zone === zone);
    if (type) properties = properties.filter((p) => p.type === type);
    if (status) properties = properties.filter((p) => p.status === status);
    if (search) {
      const s = search.toLowerCase();
      properties = properties.filter(
        (p) => p.title.toLowerCase().includes(s) || p.address.toLowerCase().includes(s) || p.reference.toLowerCase().includes(s),
      );
    }

    res.json(properties.map((p) => ({
      ...p,
      surface: parseFloat(p.surface),
      rentAmount: parseFloat(p.rentAmount),
      chargesAmount: parseFloat(p.chargesAmount || "0"),
      depositAmount: parseFloat(p.depositAmount || "0"),
      latitude: p.latitude ? parseFloat(p.latitude) : null,
      longitude: p.longitude ? parseFloat(p.longitude) : null,
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error listing properties");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = propertyBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error });
    }
    const count = await db.select({ count: sql`count(*)` }).from(propertiesTable);
    const ref = `BIEN-${String(Number(count[0].count) + 1).padStart(4, "0")}`;
    const { surface, rentAmount, chargesAmount, depositAmount, latitude, longitude, ...rest } = parsed.data;
    const [created] = await db.insert(propertiesTable).values({
      ...rest,
      reference: ref,
      surface: surface.toString(),
      rentAmount: rentAmount.toString(),
      chargesAmount: chargesAmount?.toString() ?? "0",
      depositAmount: depositAmount?.toString() ?? "0",
      latitude: latitude?.toString(),
      longitude: longitude?.toString(),
    }).returning();
    res.status(201).json({
      ...created,
      surface: parseFloat(created.surface),
      rentAmount: parseFloat(created.rentAmount),
      chargesAmount: parseFloat(created.chargesAmount || "0"),
      depositAmount: parseFloat(created.depositAmount || "0"),
      latitude: created.latitude ? parseFloat(created.latitude) : null,
      longitude: created.longitude ? parseFloat(created.longitude) : null,
      createdAt: created.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating property");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /properties/radar — unverified properties for admin review
router.get("/radar", async (req, res) => {
  try {
    const properties = await db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.isVerified, false))
      .orderBy(sql`${propertiesTable.createdAt} DESC`);
    res.json(properties.map((p) => ({
      ...p,
      surface: parseFloat(p.surface),
      rentAmount: parseFloat(p.rentAmount),
      chargesAmount: parseFloat(p.chargesAmount || "0"),
      depositAmount: parseFloat(p.depositAmount || "0"),
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error fetching radar");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /properties/radar/count
router.get("/radar/count", async (req, res) => {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(propertiesTable)
      .where(eq(propertiesTable.isVerified, false));
    res.json({ count: Number(count) || 0 });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /properties/:id/verify — validate & publish to portfolio
router.patch("/:id/verify", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(propertiesTable)
      .set({ isVerified: true, updatedAt: new Date() })
      .where(eq(propertiesTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Property not found" });
    res.json({ success: true, id: updated.id, isVerified: updated.isVerified });
  } catch (err) {
    req.log.error({ err }, "Error verifying property");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /properties/:id/quick-edit — quick edit title/price in Radar
router.patch("/:id/quick-edit", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, rentAmount } = req.body as { title?: string; rentAmount?: number };
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (title) updateData.title = title;
    if (rentAmount !== undefined) updateData.rentAmount = rentAmount.toString();
    const [updated] = await db
      .update(propertiesTable)
      .set(updateData)
      .where(eq(propertiesTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Property not found" });
    res.json({ success: true, id: updated.id });
  } catch (err) {
    req.log.error({ err }, "Error quick-editing property");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /properties/:id/publish — Action 1: Publier Vitrine (status → PUBLIC)
router.patch("/:id/publish", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(propertiesTable)
      .set({ status: "public", isVerified: true, updatedAt: new Date() })
      .where(eq(propertiesTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Property not found" });
    res.json({
      success: true,
      id: updated.id,
      status: updated.status,
      message: "Bien publié sur la Vitrine publique",
    });
  } catch (err) {
    req.log.error({ err }, "Error publishing property");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /properties/:id/diffuse — Action 2: Diffusion Réseaux (Webhook → Zapier)
router.post("/:id/diffuse", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { channels } = req.body as { channels: string[] };

    const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, id));
    if (!property) return res.status(404).json({ error: "Property not found" });

    const webhookPayload = {
      event: "property.diffuse",
      timestamp: new Date().toISOString(),
      channels: channels || [],
      property: {
        id: property.id,
        reference: property.reference,
        title: property.title,
        type: property.type,
        zone: property.zone,
        address: property.address,
        surface: parseFloat(property.surface),
        rentAmount: parseFloat(property.rentAmount),
        rooms: property.rooms,
        bathrooms: property.bathrooms,
        description: property.description,
        photos: property.photos,
        videoUrl: property.videoUrl,
        status: property.status,
      },
      meta: {
        source: "movia-immo-crm",
        action: "social-diffusion",
      },
    };

    const zapierUrl = process.env.ZAPIER_WEBHOOK_DIFFUSE_URL;
    let zapierConfirmed = false;

    if (zapierUrl) {
      try {
        const zapRes = await fetch(zapierUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookPayload),
        });
        zapierConfirmed = zapRes.ok;
      } catch (_e) {
        req.log.warn("Zapier webhook failed, continuing");
      }
    }

    res.json({
      success: true,
      message: `Webhook envoyé pour diffusion sur ${channels?.join(", ") || "tous les réseaux"}`,
      channels,
      zapierConfirmed,
      payload: webhookPayload,
    });
  } catch (err) {
    req.log.error({ err }, "Error diffusing property");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /properties/:id/sponsor — Action 3: Sponsoring Premium (TikTok/Google/Meta)
router.post("/:id/sponsor", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { platform, budget } = req.body as { platform: "tiktok" | "google" | "meta"; budget: number };

    const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, id));
    if (!property) return res.status(404).json({ error: "Property not found" });

    const webhookPayload = {
      event: "property.sponsor",
      timestamp: new Date().toISOString(),
      platform,
      budget_mad_per_day: budget,
      property: {
        id: property.id,
        reference: property.reference,
        title: property.title,
        type: property.type,
        zone: property.zone,
        rentAmount: parseFloat(property.rentAmount),
        photos: property.photos,
        videoUrl: property.videoUrl,
        description: property.description,
      },
      meta: {
        source: "movia-immo-crm",
        action: "paid-advertising",
      },
    };

    const zapierUrl = process.env.ZAPIER_WEBHOOK_SPONSOR_URL || process.env.ZAPIER_WEBHOOK_DIFFUSE_URL;
    let zapierConfirmed = false;

    if (zapierUrl) {
      try {
        const zapRes = await fetch(zapierUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookPayload),
        });
        zapierConfirmed = zapRes.ok;
      } catch (_e) {
        req.log.warn("Zapier sponsor webhook failed");
      }
    }

    res.json({
      success: true,
      message: `Campagne ${platform.toUpperCase()} lancée — ${budget} MAD/jour`,
      platform,
      budget,
      zapierConfirmed,
      payload: webhookPayload,
    });
  } catch (err) {
    req.log.error({ err }, "Error sponsoring property");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/by-zone", async (req, res) => {
  try {
    const properties = await db.select().from(propertiesTable);
    const zones: Record<string, { count: number; occupied: number; totalRevenue: number }> = {};
    for (const p of properties) {
      if (!zones[p.zone]) zones[p.zone] = { count: 0, occupied: 0, totalRevenue: 0 };
      zones[p.zone].count++;
      if (p.status === "occupe") {
        zones[p.zone].occupied++;
        zones[p.zone].totalRevenue += parseFloat(p.rentAmount);
      }
    }
    res.json(Object.entries(zones).map(([zone, data]) => ({ zone, ...data })));
  } catch (err) {
    req.log.error({ err }, "Error fetching property stats by zone");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, id));
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json({
      ...property,
      surface: parseFloat(property.surface),
      rentAmount: parseFloat(property.rentAmount),
      chargesAmount: parseFloat(property.chargesAmount || "0"),
      depositAmount: parseFloat(property.depositAmount || "0"),
      latitude: property.latitude ? parseFloat(property.latitude) : null,
      longitude: property.longitude ? parseFloat(property.longitude) : null,
      createdAt: property.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching property");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = propertyBodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error });
    const { surface, rentAmount, chargesAmount, depositAmount, latitude, longitude, ...rest } = parsed.data;
    const [updated] = await db.update(propertiesTable).set({
      ...rest,
      surface: surface.toString(),
      rentAmount: rentAmount.toString(),
      chargesAmount: chargesAmount?.toString() ?? "0",
      depositAmount: depositAmount?.toString() ?? "0",
      latitude: latitude?.toString(),
      longitude: longitude?.toString(),
      updatedAt: new Date(),
    }).where(eq(propertiesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Property not found" });
    res.json({
      ...updated,
      surface: parseFloat(updated.surface),
      rentAmount: parseFloat(updated.rentAmount),
      chargesAmount: parseFloat(updated.chargesAmount || "0"),
      depositAmount: parseFloat(updated.depositAmount || "0"),
      latitude: updated.latitude ? parseFloat(updated.latitude) : null,
      longitude: updated.longitude ? parseFloat(updated.longitude) : null,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating property");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(propertiesTable).where(eq(propertiesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting property");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
