import { Router } from "express";
import { client } from "@workspace/db";

const router = Router();

await client.execute(`
  CREATE TABLE IF NOT EXISTS calendar_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    all_day INTEGER DEFAULT 1,
    type TEXT DEFAULT 'rdv',
    description TEXT,
    property_id INTEGER,
    property_title TEXT,
    tenant_id INTEGER,
    tenant_name TEXT,
    color TEXT DEFAULT '#c17d2a',
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  )
`);

router.get("/", async (_req, res) => {
  try {
    const { rows } = await client.execute(`
      SELECT id, title, start_date, end_date, all_day, type, description,
             property_id, property_title, tenant_id, tenant_name, color, created_at
      FROM calendar_events ORDER BY start_date ASC
    `);
    res.json(rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      startDate: r.start_date,
      endDate: r.end_date,
      allDay: !!r.all_day,
      type: r.type,
      description: r.description,
      propertyId: r.property_id,
      propertyTitle: r.property_title,
      tenantId: r.tenant_id,
      tenantName: r.tenant_name,
      color: r.color,
      createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, startDate, endDate, allDay, type, description, propertyId, propertyTitle, tenantId, tenantName, color } = req.body;
    const result = await client.execute({
      sql: `INSERT INTO calendar_events (title, start_date, end_date, all_day, type, description, property_id, property_title, tenant_id, tenant_name, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [title, startDate, endDate ?? null, allDay ? 1 : 0, type ?? "rdv", description ?? null, propertyId ?? null, propertyTitle ?? null, tenantId ?? null, tenantName ?? null, color ?? "#c17d2a"],
    });
    res.json({ id: Number(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, startDate, endDate, allDay, type, description, propertyId, propertyTitle, tenantId, tenantName, color } = req.body;
    await client.execute({
      sql: `UPDATE calendar_events SET title=?, start_date=?, end_date=?, all_day=?, type=?, description=?, property_id=?, property_title=?, tenant_id=?, tenant_name=?, color=?
            WHERE id=?`,
      args: [title, startDate, endDate ?? null, allDay ? 1 : 0, type ?? "rdv", description ?? null, propertyId ?? null, propertyTitle ?? null, tenantId ?? null, tenantName ?? null, color ?? "#c17d2a", id],
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await client.execute({ sql: `DELETE FROM calendar_events WHERE id=?`, args: [req.params.id] });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
