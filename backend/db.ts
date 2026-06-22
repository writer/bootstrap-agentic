import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import pg from "pg";
import { settings } from "./config.js";
import * as schema from "./models/index.js";

export type AppDb =
  | NodePgDatabase<typeof schema>
  | PgliteDatabase<typeof schema>;

export const migrationsFolder = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "drizzle",
);

export function createDb(connectionString: string) {
  const pool = new pg.Pool({ connectionString });
  const db = drizzlePg(pool, { schema });
  return { db, pool };
}

const production = createDb(settings.databaseUrl);
export let db: AppDb = production.db;
export let pool: pg.Pool = production.pool;

export function setDb(nextDb: AppDb, nextPool?: pg.Pool) {
  db = nextDb;
  if (nextPool) {
    pool = nextPool;
  }
}

export function resetDb() {
  db = production.db;
  pool = production.pool;
}

export async function migrateDb(
  database: NodePgDatabase<typeof schema> = production.db,
) {
  await migrate(database, { migrationsFolder });
}
