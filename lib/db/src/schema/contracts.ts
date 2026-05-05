import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contractsTable = sqliteTable("contracts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reference: text("reference").notNull().unique(),
  tenantId: integer("tenant_id").notNull(),
  propertyId: integer("property_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  rentAmount: real("rent_amount").notNull(),
  chargesAmount: real("charges_amount").default(0),
  depositAmount: real("deposit_amount").default(0),
  depositPaid: integer("deposit_paid", { mode: "boolean" }).default(false),
  type: text("type").notNull().default("bail_habitation"),
  status: text("status").notNull().default("actif"),
  renewalNoticeDate: text("renewal_notice_date"),
  specialConditions: text("special_conditions"),
  witnessName: text("witness_name"),
  witnessPhone: text("witness_phone"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const insertContractSchema = createInsertSchema(contractsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contractsTable.$inferSelect;
