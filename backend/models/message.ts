import { randomUUID } from "node:crypto";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { threads } from "./thread.js";

export const messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  thread_id: varchar("thread_id").references(() => threads.id),
  role: varchar("role").$type<"user" | "assistant" | "tool">(),
  content: text("content").default(""),
  tool_call_id: varchar("tool_call_id"),
  tool_name: varchar("tool_name"),
  created_at: timestamp("created_at").defaultNow(),
});
