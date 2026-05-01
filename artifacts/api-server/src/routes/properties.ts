import { Router } from "express";
import { db } from "@workspace/db";
import { propertiesTable, tenantsTable, insertPropertySchema } from "@workspace/db";
import { eq, like, and, sql } from "drizzle-orm";

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
    const parsed = insertPropertySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error });
    }
    const count = await db.select({ count: sql`count(*)` }).from(propertiesTable);
    const ref = `BIEN-${String(Number(count[0].count) + 1).padStart(4, "0")}`;
    const [created] = await db.insert(propertiesTable).values({ ...parsed.data, reference: ref }).returning();
    res.status(201).json({
      ...created,
      surface: parseFloat(created.surface),
      rentAmount: parseFloat(created.rentAmount),
      chargesAmount: parseFloat(created.chargesAmount || "0"),
      depositAmount: parseFloat(created.depositAmount || "0"),
      createdAt: created.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating property");
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
    const parsed = insertPropertySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error });
    const [updated] = await db.update(propertiesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(propertiesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Property not found" });
    res.json({
      ...updated,
      surface: parseFloat(updated.surface),
      rentAmount: parseFloat(updated.rentAmount),
      chargesAmount: parseFloat(updated.chargesAmount || "0"),
      depositAmount: parseFloat(updated.depositAmount || "0"),
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
