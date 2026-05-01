import { Router } from "express";
import { db } from "@workspace/db";
import { contractsTable, tenantsTable, propertiesTable, insertContractSchema } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

function formatContract(c: typeof contractsTable.$inferSelect, tenantName?: string, propertyTitle?: string) {
  const now = new Date();
  const end = new Date(c.endDate);
  const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return {
    ...c,
    rentAmount: parseFloat(c.rentAmount),
    chargesAmount: parseFloat(c.chargesAmount || "0"),
    depositAmount: parseFloat(c.depositAmount || "0"),
    tenantName: tenantName || "",
    propertyTitle: propertyTitle || "",
    daysUntilExpiry,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const { status, tenantId, propertyId } = req.query as Record<string, string>;
    let contracts = await db.select().from(contractsTable).orderBy(sql`${contractsTable.createdAt} DESC`);

    if (status) contracts = contracts.filter((c) => c.status === status);
    if (tenantId) contracts = contracts.filter((c) => c.tenantId === parseInt(tenantId));
    if (propertyId) contracts = contracts.filter((c) => c.propertyId === parseInt(propertyId));

    const tenants = await db.select().from(tenantsTable);
    const properties = await db.select().from(propertiesTable);
    const tenantMap = new Map(tenants.map((t) => [t.id, `${t.firstName} ${t.lastName}`]));
    const propMap = new Map(properties.map((p) => [p.id, p.title]));

    res.json(contracts.map((c) => formatContract(c, tenantMap.get(c.tenantId), propMap.get(c.propertyId))));
  } catch (err) {
    req.log.error({ err }, "Error listing contracts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = insertContractSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error });
    const count = await db.select({ count: sql`count(*)` }).from(contractsTable);
    const ref = `CONT-${String(Number(count[0].count) + 1).padStart(4, "0")}`;
    const [created] = await db.insert(contractsTable).values({ ...parsed.data, reference: ref }).returning();
    res.status(201).json(formatContract(created));
  } catch (err) {
    req.log.error({ err }, "Error creating contract");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/expiring-soon", async (req, res) => {
  try {
    const contracts = await db.select().from(contractsTable).where(eq(contractsTable.status, "actif"));
    const tenants = await db.select().from(tenantsTable);
    const properties = await db.select().from(propertiesTable);
    const tenantMap = new Map(tenants.map((t) => [t.id, `${t.firstName} ${t.lastName}`]));
    const propMap = new Map(properties.map((p) => [p.id, p.title]));

    const now = new Date();
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const expiring = contracts.filter((c) => {
      const end = new Date(c.endDate);
      return end <= in60Days && end >= now;
    });
    res.json(expiring.map((c) => formatContract(c, tenantMap.get(c.tenantId), propMap.get(c.propertyId))));
  } catch (err) {
    req.log.error({ err }, "Error fetching expiring contracts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [contract] = await db.select().from(contractsTable).where(eq(contractsTable.id, id));
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, contract.tenantId));
    const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, contract.propertyId));
    res.json(formatContract(contract, tenant ? `${tenant.firstName} ${tenant.lastName}` : "", property?.title));
  } catch (err) {
    req.log.error({ err }, "Error fetching contract");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertContractSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error });
    const [updated] = await db.update(contractsTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(contractsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Contract not found" });
    res.json(formatContract(updated));
  } catch (err) {
    req.log.error({ err }, "Error updating contract");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
