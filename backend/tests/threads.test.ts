import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "../db.js";
import { app } from "../main.js";
import { messages } from "../models/message.js";
import { threads } from "../models/thread.js";
import { MessageResponse } from "../schemas/thread.js";

describe("threads", () => {
  it("test_health", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("test_create_thread", async () => {
    const res = await app.request("/threads", {
      method: "POST",
      body: JSON.stringify({ title: "Test Thread" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { title: string; id: string };
    expect(data.title).toBe("Test Thread");
    expect(data.id).toBeDefined();
  });

  it("accepts trailing slash on list/create", async () => {
    const listRes = await app.request("/threads/");
    expect(listRes.status).toBe(200);

    const createRes = await app.request("/threads/", {
      method: "POST",
      body: JSON.stringify({ title: "Slash Test" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(createRes.status).toBe(200);
  });

  it("test_message_serialization", async () => {
    const threadId = randomUUID();
    await db
      .insert(threads)
      .values({ id: threadId, title: "Serialization Test" });

    const msgId = randomUUID();
    await db.insert(messages).values({
      id: msgId,
      thread_id: threadId,
      role: "user",
      content: "Hello, world!",
    });

    const [msg] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, msgId));

    // BUG: MessageResponse.content is z.number() but content is a string — this parse will throw
    const data = MessageResponse.parse(msg);
    expect(data.content).toBe("Hello, world!");
  });

  it("test_thread_messages_isolation", async () => {
    const t1Id = randomUUID();
    const t2Id = randomUUID();
    await db.insert(threads).values([
      { id: t1Id, title: "Thread A" },
      { id: t2Id, title: "Thread B" },
    ]);

    for (let i = 0; i < 3; i++) {
      await db.insert(messages).values({
        thread_id: t1Id,
        role: "user",
        content: `msg-a-${i}`,
      });
    }
    for (let i = 0; i < 2; i++) {
      await db.insert(messages).values({
        thread_id: t2Id,
        role: "user",
        content: `msg-b-${i}`,
      });
    }

    const threadRes = await app.request(`/threads/${t1Id}`);
    expect(threadRes.status).toBe(200);

    // BUG: GET /threads/:thread_id/messages endpoint does not exist
    const msgRes = await app.request(`/threads/${t1Id}/messages`);
    expect(msgRes.status).toBe(200);
    const data = await msgRes.json();
    expect(data).toHaveLength(3);
  });
});
