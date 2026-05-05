import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const propertiesTable = sqliteTable("properties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reference: text("reference").notNull().unique(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  zone: text("zone").notNull(),
  address: text("address").notNull(),
  floor: integer("floor"),
  surface: real("surface").notNull(),
  rooms: integer("rooms"),
  bathrooms: integer("bathrooms"),
  rentAmount: real("rent_amount").notNull(),
  chargesAmount: real("charges_amount").default(0),
  depositAmount: real("deposit_amount").default(0),
  status: text("status").notNull().default("disponible"),
  amenities: text("amenities", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  photos: text("photos", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  videoUrl: text("video_url"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  description: text("description"),
  currentTenantId: integer("current_tenant_id"),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(true),
  source: text("source").default("manuel"),
  contactOwner: text("contact_owner"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
