import { pgTable, serial, text, numeric, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  zone: text("zone").notNull(),
  address: text("address").notNull(),
  floor: integer("floor"),
  surface: numeric("surface", { precision: 10, scale: 2 }).notNull(),
  rooms: integer("rooms"),
  bathrooms: integer("bathrooms"),
  rentAmount: numeric("rent_amount", { precision: 10, scale: 2 }).notNull(),
  chargesAmount: numeric("charges_amount", { precision: 10, scale: 2 }).default("0"),
  depositAmount: numeric("deposit_amount", { precision: 10, scale: 2 }).default("0"),
  status: text("status").notNull().default("disponible"),
  amenities: text("amenities").array().default([]),
  photos: text("photos").array().default([]),
  videoUrl: text("video_url"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  description: text("description"),
  currentTenantId: integer("current_tenant_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
