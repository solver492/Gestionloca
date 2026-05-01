import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable, insertNotificationSchema } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { unreadOnly } = req.query as Record<string, string>;
    let notifications = await db.select().from(notificationsTable).orderBy(sql`${notificationsTable.createdAt} DESC`);
    if (unreadOnly === "true") {
      notifications = notifications.filter((n) => !n.isRead);
    }
    res.json(notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Error listing notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/read", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Notification not found" });
    res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error marking notification as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/read-all", async (req, res) => {
  try {
    const result = await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.isRead, false)).returning();
    res.json({ updated: result.length });
  } catch (err) {
    req.log.error({ err }, "Error marking all notifications as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
