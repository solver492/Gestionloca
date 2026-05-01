import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, tenantsTable, propertiesTable, insertPaymentSchema } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

function formatPayment(p: typeof paymentsTable.$inferSelect, tenantName?: string, propertyTitle?: string) {
  return {
    ...p,
    amount: parseFloat(p.amount),
    paidAmount: parseFloat(p.paidAmount || "0"),
    penaltyAmount: parseFloat(p.penaltyAmount || "0"),
    tenantName: tenantName || "",
    propertyTitle: propertyTitle || "",
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const { status, month, tenantId, propertyId } = req.query as Record<string, string>;
    let payments = await db.select().from(paymentsTable).orderBy(sql`${paymentsTable.createdAt} DESC`);

    if (status) payments = payments.filter((p) => p.status === status);
    if (month) payments = payments.filter((p) => p.month === month);
    if (tenantId) payments = payments.filter((p) => p.tenantId === parseInt(tenantId));
    if (propertyId) payments = payments.filter((p) => p.propertyId === parseInt(propertyId));

    const tenants = await db.select().from(tenantsTable);
    const properties = await db.select().from(propertiesTable);
    const tenantMap = new Map(tenants.map((t) => [t.id, `${t.firstName} ${t.lastName}`]));
    const propMap = new Map(properties.map((p) => [p.id, p.title]));

    res.json(payments.map((p) => formatPayment(p, tenantMap.get(p.tenantId), propMap.get(p.propertyId))));
  } catch (err) {
    req.log.error({ err }, "Error listing payments");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = insertPaymentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error });
    const count = await db.select({ count: sql`count(*)` }).from(paymentsTable);
    const ref = `PAY-${String(Number(count[0].count) + 1).padStart(5, "0")}`;
    const receiptNumber = `REC-${Date.now()}`;
    const [created] = await db.insert(paymentsTable).values({ ...parsed.data, reference: ref, receiptNumber }).returning();
    res.status(201).json(formatPayment(created));
  } catch (err) {
    req.log.error({ err }, "Error creating payment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/summary", async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.month, currentMonth));

    const totalExpected = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalCollected = payments.filter((p) => p.status === "paye").reduce((sum, p) => sum + parseFloat(p.paidAmount || "0"), 0);
    const latePayments = payments.filter((p) => p.status === "en_retard");
    const partialPayments = payments.filter((p) => p.status === "partiel");
    const totalLate = latePayments.reduce((sum, p) => sum + parseFloat(p.amount) - parseFloat(p.paidAmount || "0"), 0);
    const totalPartial = partialPayments.reduce((sum, p) => sum + parseFloat(p.amount) - parseFloat(p.paidAmount || "0"), 0);
    const totalPending = payments.filter((p) => p.status === "en_attente").reduce((sum, p) => sum + parseFloat(p.amount), 0);

    res.json({
      totalExpected,
      totalCollected,
      totalPending,
      totalLate,
      totalLateAmount: totalLate,
      totalPartial,
      collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0,
      paymentsCount: payments.length,
      lateCount: latePayments.length,
      partialCount: partialPayments.length,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching payment summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.id, id));
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, payment.tenantId));
    const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, payment.propertyId));
    res.json(formatPayment(payment, tenant ? `${tenant.firstName} ${tenant.lastName}` : "", property?.title));
  } catch (err) {
    req.log.error({ err }, "Error fetching payment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertPaymentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error });
    const [updated] = await db.update(paymentsTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(paymentsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Payment not found" });
    res.json(formatPayment(updated));
  } catch (err) {
    req.log.error({ err }, "Error updating payment");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
