import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const apiKeysTable = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  source: text("source"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

export type ApiKey = typeof apiKeysTable.$inferSelect;
