import { randomUUID } from "node:crypto";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const threads = pgTable("threads", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  title: varchar("title").default("New Chat"),
  created_at: timestamp("created_at").defaultNow(),
});
