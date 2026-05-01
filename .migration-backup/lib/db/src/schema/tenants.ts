import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tenantsTable = pgTable("tenants", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  cin: text("cin").notNull().unique(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  profession: text("profession"),
  nationality: text("nationality").default("Marocaine"),
  dateOfBirth: text("date_of_birth"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  status: text("status").notNull().default("actif"),
  propertyId: integer("property_id"),
  rentAmount: numeric("rent_amount", { precision: 10, scale: 2 }),
  balance: numeric("balance", { precision: 10, scale: 2 }).default("0"),
  paymentScore: integer("payment_score").default(100),
  documents: text("documents").array().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTenantSchema = createInsertSchema(tenantsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenantsTable.$inferSelect;
