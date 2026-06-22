import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterAll, beforeAll, beforeEach } from "vitest";
import { db, migrationsFolder, resetDb, setDb } from "../db.js";
import * as schema from "../models/index.js";

let pglite: PGlite;

beforeAll(async () => {
  pglite = new PGlite();
  const testDb = drizzle(pglite, { schema });
  await migrate(testDb, { migrationsFolder });
  setDb(testDb);
});

afterAll(async () => {
  resetDb();
  await pglite.close();
});

beforeEach(async () => {
  await db.execute(sql`TRUNCATE messages, threads RESTART IDENTITY CASCADE`);
});
