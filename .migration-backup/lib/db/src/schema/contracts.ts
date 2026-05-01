import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contractsTable = pgTable("contracts", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  tenantId: integer("tenant_id").notNull(),
  propertyId: integer("property_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  rentAmount: numeric("rent_amount", { precision: 10, scale: 2 }).notNull(),
  chargesAmount: numeric("charges_amount", { precision: 10, scale: 2 }).default("0"),
  depositAmount: numeric("deposit_amount", { precision: 10, scale: 2 }).default("0"),
  depositPaid: boolean("deposit_paid").default(false),
  type: text("type").notNull().default("bail_habitation"),
  status: text("status").notNull().default("actif"),
  renewalNoticeDate: text("renewal_notice_date"),
  specialConditions: text("special_conditions"),
  witnessName: text("witness_name"),
  witnessPhone: text("witness_phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertContractSchema = createInsertSchema(contractsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contractsTable.$inferSelect;
