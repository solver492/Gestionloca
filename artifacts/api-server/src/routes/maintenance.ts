import { Router } from "express";
import { db } from "@workspace/db";
import { maintenanceTable, propertiesTable, tenantsTable, insertMaintenanceSchema } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

function formatTicket(t: typeof maintenanceTable.$inferSelect, propertyTitle?: string, tenantName?: string) {
  return {
    ...t,
    estimatedCost: t.estimatedCost ? parseFloat(t.estimatedCost) : null,
    actualCost: t.actualCost ? parseFloat(t.actualCost) : null,
    propertyTitle: propertyTitle || "",
    tenantName: tenantName || "",
    createdAt: t.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const { status, priority, propertyId } = req.query as Record<string, string>;
    let tickets = await db.select().from(maintenanceTable).orderBy(sql`${maintenanceTable.createdAt} DESC`);

    if (status) tickets = tickets.filter((t) => t.status === status);
    if (priority) tickets = tickets.filter((t) => t.priority === priority);
    if (propertyId) tickets = tickets.filter((t) => t.propertyId === parseInt(propertyId));

    const properties = await db.select().from(propertiesTable);
    const tenants = await db.select().from(tenantsTable);
    const propMap = new Map(properties.map((p) => [p.id, p.title]));
    const tenantMap = new Map(tenants.map((t) => [t.id, `${t.firstName} ${t.lastName}`]));

    res.json(tickets.map((t) => formatTicket(t, propMap.get(t.propertyId), t.tenantId ? tenantMap.get(t.tenantId) : undefined)));
  } catch (err) {
    req.log.error({ err }, "Error listing maintenance tickets");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = insertMaintenanceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error });
    const count = await db.select({ count: sql`count(*)` }).from(maintenanceTable);
    const ref = `MAINT-${String(Number(count[0].count) + 1).padStart(4, "0")}`;
    const [created] = await db.insert(maintenanceTable).values({ ...parsed.data, reference: ref }).returning();
    res.status(201).json(formatTicket(created));
  } catch (err) {
    req.log.error({ err }, "Error creating maintenance ticket");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/by-status", async (req, res) => {
  try {
    const tickets = await db.select().from(maintenanceTable);
    const statuses: Record<string, { count: number; totalCost: number }> = {};
    for (const t of tickets) {
      if (!statuses[t.status]) statuses[t.status] = { count: 0, totalCost: 0 };
      statuses[t.status].count++;
      statuses[t.status].totalCost += parseFloat(t.actualCost || "0");
    }
    res.json(Object.entries(statuses).map(([status, data]) => ({ status, ...data })));
  } catch (err) {
    req.log.error({ err }, "Error fetching maintenance stats by status");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [ticket] = await db.select().from(maintenanceTable).where(eq(maintenanceTable.id, id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, ticket.propertyId));
    const tenant = ticket.tenantId ? (await db.select().from(tenantsTable).where(eq(tenantsTable.id, ticket.tenantId)))[0] : null;
    res.json(formatTicket(ticket, property?.title, tenant ? `${tenant.firstName} ${tenant.lastName}` : undefined));
  } catch (err) {
    req.log.error({ err }, "Error fetching maintenance ticket");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertMaintenanceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error });
    const [updated] = await db.update(maintenanceTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(maintenanceTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Ticket not found" });
    res.json(formatTicket(updated));
  } catch (err) {
    req.log.error({ err }, "Error updating maintenance ticket");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
