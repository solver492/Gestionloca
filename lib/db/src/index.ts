import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function resolveWorkspaceRoot(startDir: string): string {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(dir, "lib", "db"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(startDir);
}

const workspaceRoot = resolveWorkspaceRoot(process.cwd());
const defaultDbPath = path.join(workspaceRoot, "lib", "db", "sqlite.db");

function resolveLibsqlUrl(rawUrl: string, fallback: string): string {
  try {
    const u = new URL(rawUrl);
    if (u.protocol === "postgresql:" || u.protocol === "postgres:") {
      return fallback;
    }
    u.searchParams.delete("sslmode");
    u.searchParams.delete("ssl");
    return u.toString();
  } catch {
    return fallback;
  }
}

const rawUrl = process.env.DATABASE_URL || "";
const fallbackUrl = pathToFileURL(defaultDbPath).toString();
const databaseUrl = rawUrl ? resolveLibsqlUrl(rawUrl, fallbackUrl) : fallbackUrl;

export const client = createClient({ url: databaseUrl });
export const db = drizzle(client, { schema });

export * from "./schema";
