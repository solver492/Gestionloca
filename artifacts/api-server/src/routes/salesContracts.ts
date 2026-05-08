import { Router } from "express";
import { client } from "@workspace/db";
import { z } from "zod";

const router = Router();

async function ensureTable() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS sales_contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL DEFAULT 'mandat_exclusif',
      property_title TEXT NOT NULL,
      property_address TEXT,
      property_zone TEXT,
      property_surface REAL,
      price_asked REAL,
      owner_name TEXT NOT NULL,
      owner_cin TEXT,
      owner_phone TEXT,
      owner_email TEXT,
      owner_address TEXT,
      buyer_name TEXT,
      buyer_cin TEXT,
      buyer_phone TEXT,
      buyer_address TEXT,
      agency_commission REAL DEFAULT 2.5,
      duration_days INTEGER DEFAULT 90,
      start_date TEXT NOT NULL,
      end_date TEXT,
      status TEXT NOT NULL DEFAULT 'actif',
      conditions TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    )
  `);
}
ensureTable().catch(console.error);

const contractSchema = z.object({
  type: z.enum(["mandat_exclusif", "mandat_simple", "compromis_vente", "offre_achat", "promesse_vente"]).default("mandat_exclusif"),
  propertyTitle: z.string(),
  propertyAddress: z.string().optional(),
  propertyZone: z.string().optional(),
  propertySurface: z.coerce.number().optional(),
  priceAsked: z.coerce.number().optional(),
  ownerName: z.string(),
  ownerCin: z.string().optional(),
  ownerPhone: z.string().optional(),
  ownerEmail: z.string().optional(),
  ownerAddress: z.string().optional(),
  buyerName: z.string().optional(),
  buyerCin: z.string().optional(),
  buyerPhone: z.string().optional(),
  buyerAddress: z.string().optional(),
  agencyCommission: z.coerce.number().default(2.5),
  durationDays: z.coerce.number().default(90),
  startDate: z.string(),
  endDate: z.string().optional(),
  status: z.string().default("actif"),
  conditions: z.string().optional(),
  notes: z.string().optional(),
});

router.get("/", async (_req, res) => {
  try {
    const result = await client.execute("SELECT * FROM sales_contracts ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = contractSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error });
    const d = parsed.data;
    const countResult = await client.execute("SELECT COUNT(*) as c FROM sales_contracts");
    const count = Number((countResult.rows[0] as any).c || 0);
    const ref = `MV-${String(count + 1).padStart(4, "0")}`;
    await client.execute({
      sql: `INSERT INTO sales_contracts (
        reference, type, property_title, property_address, property_zone, property_surface,
        price_asked, owner_name, owner_cin, owner_phone, owner_email, owner_address,
        buyer_name, buyer_cin, buyer_phone, buyer_address,
        agency_commission, duration_days, start_date, end_date, status, conditions, notes
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        ref, d.type, d.propertyTitle, d.propertyAddress ?? null, d.propertyZone ?? null, d.propertySurface ?? null,
        d.priceAsked ?? null, d.ownerName, d.ownerCin ?? null, d.ownerPhone ?? null, d.ownerEmail ?? null, d.ownerAddress ?? null,
        d.buyerName ?? null, d.buyerCin ?? null, d.buyerPhone ?? null, d.buyerAddress ?? null,
        d.agencyCommission, d.durationDays, d.startDate, d.endDate ?? null, d.status, d.conditions ?? null, d.notes ?? null,
      ],
    });
    const newRow = await client.execute({ sql: "SELECT * FROM sales_contracts WHERE reference = ?", args: [ref] });
    res.status(201).json(newRow.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await client.execute({ sql: "UPDATE sales_contracts SET status = ?, updated_at = ? WHERE id = ?", args: [status, Date.now(), id] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await client.execute({ sql: "DELETE FROM sales_contracts WHERE id = ?", args: [id] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
