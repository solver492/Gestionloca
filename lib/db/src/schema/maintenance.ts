import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const maintenanceTable = sqliteTable("maintenance_tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reference: text("reference").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id"),
  category: text("category").notNull().default("autre"),
  priority: text("priority").notNull().default("normale"),
  status: text("status").notNull().default("ouvert"),
  technicianName: text("technician_name"),
  technicianPhone: text("technician_phone"),
  estimatedCost: real("estimated_cost"),
  actualCost: real("actual_cost"),
  scheduledDate: text("scheduled_date"),
  completedDate: text("completed_date"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const insertMaintenanceSchema = createInsertSchema(maintenanceTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type MaintenanceTicket = typeof maintenanceTable.$inferSelect;
