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
const databaseUrl = process.env.DATABASE_URL || pathToFileURL(defaultDbPath).toString();

export const client = createClient({ url: databaseUrl });
export const db = drizzle(client, { schema });

export * from "./schema";
