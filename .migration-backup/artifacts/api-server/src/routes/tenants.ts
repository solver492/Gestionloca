import { Router } from "express";
import { db } from "@workspace/db";
import { tenantsTable, propertiesTable, paymentsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const tenantBodySchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  cin: z.string(),
  email: z.string().default(""),
  phone: z.string(),
  profession: z.string().optional(),
  nationality: z.string().optional().default("Marocaine"),
  dateOfBirth: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  status: z.string().default("actif"),
  propertyId: z.coerce.number().optional(),
  notes: z.string().optional(),
});

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search, status } = req.query as Record<string, string>;
    const tenants = await db.select().from(tenantsTable).orderBy(sql`${tenantsTable.createdAt} DESC`);
    const properties = await db.select().from(propertiesTable);
    const propMap = new Map(properties.map((p) => [p.id, p.title]));

    let result = tenants.map((t) => ({
      ...t,
      rentAmount: t.rentAmount ? parseFloat(t.rentAmount) : null,
      balance: parseFloat(t.balance || "0"),
      propertyTitle: t.propertyId ? propMap.get(t.propertyId) : null,
      createdAt: t.createdAt.toISOString(),
    }));

    if (status) result = result.filter((t) => t.status === status);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (t) => t.firstName.toLowerCase().includes(s) || t.lastName.toLowerCase().includes(s) || t.cin.toLowerCase().includes(s) || t.email.toLowerCase().includes(s),
      );
    }
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error listing tenants");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = tenantBodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error });
    const [created] = await db.insert(tenantsTable).values(parsed.data).returning();
    res.status(201).json({
      ...created,
      rentAmount: created.rentAmount ? parseFloat(created.rentAmount) : null,
      balance: parseFloat(created.balance || "0"),
      createdAt: created.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating tenant");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, id));
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });
    let propertyTitle = null;
    if (tenant.propertyId) {
      const [prop] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, tenant.propertyId));
      propertyTitle = prop?.title;
    }
    res.json({
      ...tenant,
      rentAmount: tenant.rentAmount ? parseFloat(tenant.rentAmount) : null,
      balance: parseFloat(tenant.balance || "0"),
      propertyTitle,
      createdAt: tenant.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching tenant");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = tenantBodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error });
    const [updated] = await db.update(tenantsTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(tenantsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Tenant not found" });
    res.json({
      ...updated,
      rentAmount: updated.rentAmount ? parseFloat(updated.rentAmount) : null,
      balance: parseFloat(updated.balance || "0"),
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating tenant");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(tenantsTable).where(eq(tenantsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting tenant");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/payments", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.tenantId, id)).orderBy(sql`${paymentsTable.createdAt} DESC`);
    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, id));
    const [property] = tenant?.propertyId ? await db.select().from(propertiesTable).where(eq(propertiesTable.id, tenant.propertyId)) : [null];
    res.json(payments.map((p) => ({
      ...p,
      amount: parseFloat(p.amount),
      paidAmount: parseFloat(p.paidAmount || "0"),
      penaltyAmount: parseFloat(p.penaltyAmount || "0"),
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : "",
      propertyTitle: property?.title || "",
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error fetching tenant payments");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
