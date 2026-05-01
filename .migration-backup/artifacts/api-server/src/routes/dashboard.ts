import { Router } from "express";
import { db } from "@workspace/db";
import { propertiesTable, tenantsTable, paymentsTable, contractsTable, maintenanceTable, activitiesTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";

const router = Router();

router.get("/kpis", async (req, res) => {
  try {
    const [propertiesResult, tenantsResult, paymentsResult, maintenanceResult, contractsResult] = await Promise.all([
      db.select().from(propertiesTable),
      db.select().from(tenantsTable).where(eq(tenantsTable.status, "actif")),
      db.select().from(paymentsTable),
      db.select().from(maintenanceTable),
      db.select().from(contractsTable).where(eq(contractsTable.status, "actif")),
    ]);

    const totalProperties = propertiesResult.length;
    const occupiedProperties = propertiesResult.filter((p) => p.status === "occupe").length;
    const totalTenants = tenantsResult.length;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthPayments = paymentsResult.filter((p) => p.month === currentMonth);
    const monthlyRevenue = monthPayments.reduce((sum, p) => sum + parseFloat(p.paidAmount || "0"), 0);

    const unpaidPayments = paymentsResult.filter((p) => p.status === "en_retard" || p.status === "en_attente");
    const unpaidRents = unpaidPayments.length;
    const unpaidAmount = unpaidPayments.reduce((sum, p) => sum + parseFloat(p.amount) - parseFloat(p.paidAmount || "0"), 0);

    const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;
    const maintenanceOpen = maintenanceResult.filter((m) => m.status === "ouvert" || m.status === "en_cours").length;

    const now = new Date();
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const expiringContracts = contractsResult.filter((c) => {
      const end = new Date(c.endDate);
      return end <= in60Days && end >= now;
    }).length;

    const totalExpected = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const collectionRate = totalExpected > 0 ? (monthlyRevenue / totalExpected) * 100 : 0;

    res.json({
      totalProperties,
      occupiedProperties,
      totalTenants,
      monthlyRevenue,
      unpaidRents,
      unpaidAmount,
      occupancyRate,
      maintenanceOpen,
      expiringContracts,
      collectionRate,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching dashboard KPIs");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/activity", async (req, res) => {
  try {
    const activities = await db.select().from(activitiesTable).orderBy(sql`${activitiesTable.createdAt} DESC`).limit(20);
    res.json(activities.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error fetching activities");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/alerts", async (req, res) => {
  try {
    const alerts: Array<{
      id: number;
      type: string;
      severity: string;
      title: string;
      description: string;
      entityId?: number;
      entityType?: string;
      createdAt: string;
    }> = [];
    let alertId = 1;
    const now = new Date();

    const unpaidPayments = await db.select().from(paymentsTable).where(eq(paymentsTable.status, "en_retard"));
    if (unpaidPayments.length > 0) {
      alerts.push({
        id: alertId++,
        type: "unpaid",
        severity: unpaidPayments.length > 5 ? "critical" : "high",
        title: `${unpaidPayments.length} loyer(s) en retard`,
        description: `Il y a ${unpaidPayments.length} paiement(s) en retard qui nécessitent une attention immédiate.`,
        entityType: "payment",
        createdAt: now.toISOString(),
      });
    }

    const activeContracts = await db.select().from(contractsTable).where(eq(contractsTable.status, "actif"));
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = activeContracts.filter((c) => {
      const end = new Date(c.endDate);
      return end <= in30Days && end >= now;
    });
    if (expiringSoon.length > 0) {
      alerts.push({
        id: alertId++,
        type: "expiring_contract",
        severity: "medium",
        title: `${expiringSoon.length} contrat(s) expirent bientôt`,
        description: `${expiringSoon.length} contrat(s) arrivent à expiration dans les 30 prochains jours.`,
        entityType: "contract",
        createdAt: now.toISOString(),
      });
    }

    const urgentTickets = await db.select().from(maintenanceTable)
      .where(eq(maintenanceTable.priority, "urgente"));
    const openUrgent = urgentTickets.filter((t) => t.status === "ouvert" || t.status === "en_cours");
    if (openUrgent.length > 0) {
      alerts.push({
        id: alertId++,
        type: "maintenance_urgent",
        severity: "high",
        title: `${openUrgent.length} ticket(s) de maintenance urgent(s)`,
        description: `Des interventions urgentes sont requises sur vos propriétés.`,
        entityType: "maintenance",
        createdAt: now.toISOString(),
      });
    }

    res.json(alerts);
  } catch (err) {
    req.log.error({ err }, "Error fetching alerts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/revenue-chart", async (req, res) => {
  try {
    const payments = await db.select().from(paymentsTable);
    const months: Record<string, { revenue: number; collected: number; pending: number }> = {};

    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      months[key] = { revenue: 0, collected: 0, pending: 0 };
    }

    for (const p of payments) {
      if (months[p.month] !== undefined) {
        months[p.month].revenue += parseFloat(p.amount);
        months[p.month].collected += parseFloat(p.paidAmount || "0");
        if (p.status === "en_retard" || p.status === "en_attente" || p.status === "partiel") {
          months[p.month].pending += parseFloat(p.amount) - parseFloat(p.paidAmount || "0");
        }
      }
    }

    const result = Object.entries(months).map(([month, data]) => ({
      month,
      ...data,
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching revenue chart");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/occupancy-chart", async (req, res) => {
  try {
    const properties = await db.select().from(propertiesTable);
    const zones: Record<string, { total: number; occupied: number }> = {};

    for (const p of properties) {
      if (!zones[p.zone]) zones[p.zone] = { total: 0, occupied: 0 };
      zones[p.zone].total++;
      if (p.status === "occupe") zones[p.zone].occupied++;
    }

    const result = Object.entries(zones).map(([zone, data]) => ({
      zone,
      total: data.total,
      occupied: data.occupied,
      rate: data.total > 0 ? (data.occupied / data.total) * 100 : 0,
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching occupancy chart");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
