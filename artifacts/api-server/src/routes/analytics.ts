import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, propertiesTable, maintenanceTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/financial", async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const payments = await db.select().from(paymentsTable);
    const tickets = await db.select().from(maintenanceTable);

    const months: Record<string, { revenue: number; expenses: number; collectedCount: number; totalCount: number }> = {};
    for (let m = 1; m <= 12; m++) {
      const key = `${year}-${String(m).padStart(2, "0")}`;
      months[key] = { revenue: 0, expenses: 0, collectedCount: 0, totalCount: 0 };
    }

    for (const p of payments) {
      if (months[p.month] !== undefined) {
        months[p.month].totalCount++;
        if (p.status === "paye") {
          months[p.month].revenue += parseFloat(p.paidAmount || "0");
          months[p.month].collectedCount++;
        }
      }
    }

    for (const t of tickets) {
      const month = t.completedDate ? t.completedDate.slice(0, 7) : t.createdAt.toISOString().slice(0, 7);
      if (months[month] !== undefined && t.actualCost) {
        months[month].expenses += parseFloat(t.actualCost);
      }
    }

    const result = Object.entries(months).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses,
      collectionRate: data.totalCount > 0 ? (data.collectedCount / data.totalCount) * 100 : 0,
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching financial analytics");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/occupancy", async (req, res) => {
  try {
    const payments = await db.select().from(paymentsTable);
    const properties = await db.select().from(propertiesTable);
    const totalProperties = properties.length;

    const months: Record<string, Set<number>> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      months[key] = new Set();
    }

    for (const p of payments) {
      if (months[p.month] !== undefined && (p.status === "paye" || p.status === "partiel")) {
        months[p.month].add(p.propertyId);
      }
    }

    const result = Object.entries(months).map(([month, occupiedSet]) => ({
      month,
      occupied: occupiedSet.size,
      total: totalProperties,
      occupancyRate: totalProperties > 0 ? (occupiedSet.size / totalProperties) * 100 : 0,
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching occupancy analytics");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profitability", async (req, res) => {
  try {
    const properties = await db.select().from(propertiesTable);
    const payments = await db.select().from(paymentsTable);
    const tickets = await db.select().from(maintenanceTable);

    const result = properties.map((prop) => {
      const propPayments = payments.filter((p) => p.propertyId === prop.id && p.status === "paye");
      const propTickets = tickets.filter((t) => t.propertyId === prop.id && t.actualCost);
      const annualRevenue = propPayments.reduce((sum, p) => sum + parseFloat(p.paidAmount || "0"), 0);
      const annualExpenses = propTickets.reduce((sum, t) => sum + parseFloat(t.actualCost || "0"), 0);
      const netProfit = annualRevenue - annualExpenses;
      const propertyValue = parseFloat(prop.rentAmount) * 120;
      const roi = propertyValue > 0 ? (netProfit / propertyValue) * 100 : 0;
      return {
        propertyId: prop.id,
        propertyTitle: prop.title,
        zone: prop.zone,
        annualRevenue,
        annualExpenses,
        netProfit,
        roi,
      };
    });
    res.json(result.sort((a, b) => b.annualRevenue - a.annualRevenue));
  } catch (err) {
    req.log.error({ err }, "Error fetching profitability analytics");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
