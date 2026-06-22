import type { RouteHandler } from "@hono/zod-openapi";
import { asc, desc, eq } from "drizzle-orm";
import { runAgent } from "../../agent/loop.js";
import { db } from "../../db.js";
import { messages } from "../../models/message.js";
import { threads } from "../../models/thread.js";
import { MessageResponse, ThreadResponse } from "../../schemas/thread.js";
import type {
  ChatRoute,
  CreateThreadRoute,
  GetThreadRoute,
  ListThreadsRoute,
} from "./threads.routes.js";

export const listThreads: RouteHandler<ListThreadsRoute> = async (c) => {
  const result = await db
    .select()
    .from(threads)
    .orderBy(desc(threads.created_at));

  return c.json(
    result.map((thread) => ThreadResponse.parse(thread)),
    200,
  );
};

export const createThread: RouteHandler<CreateThreadRoute> = async (c) => {
  const body = c.req.valid("json");
  const [thread] = await db
    .insert(threads)
    .values({ title: body.title })
    .returning();

  return c.json(ThreadResponse.parse(thread), 200);
};

export const getThread: RouteHandler<GetThreadRoute> = async (c) => {
  const { thread_id: threadId } = c.req.valid("param");
  const [thread] = await db
    .select()
    .from(threads)
    .where(eq(threads.id, threadId));

  if (!thread) {
    return c.json({ detail: "Thread not found" }, 404);
  }

  return c.json(ThreadResponse.parse(thread), 200);
};

export const chat: RouteHandler<ChatRoute> = async (c) => {
  const { thread_id: threadId } = c.req.valid("param");

  const [thread] = await db
    .select()
    .from(threads)
    .where(eq(threads.id, threadId));

  if (!thread) {
    return c.json({ detail: "Thread not found" }, 404);
  }

  const body = c.req.valid("json");
  const responseText = await runAgent(threadId, body.message, db);

  const allMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.thread_id, threadId))
    .orderBy(asc(messages.created_at));

  return c.json(
    {
      thread_id: threadId,
      response: responseText,
      messages: allMessages.map((m) => MessageResponse.parse(m)),
    },
    200,
  );
};
