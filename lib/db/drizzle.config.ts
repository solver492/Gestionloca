import { defineConfig } from "drizzle-kit";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

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

export default defineConfig({
  schema: "./src/schema/*.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
  },
});
