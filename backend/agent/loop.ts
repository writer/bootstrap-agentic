import { asc, eq } from "drizzle-orm";
import type OpenAI from "openai";
import type { AppDb } from "../db.js";
import { messages } from "../models/message.js";
import { llmClient } from "../services/llm.js";
import { SYSTEM_PROMPT } from "./prompts.js";
import { executeTool, getRegisteredTools } from "./tools/index.js";

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export async function runAgent(
  threadId: string,
  userMessage: string,
  db: AppDb,
): Promise<string> {
  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.thread_id, threadId))
    .orderBy(asc(messages.created_at));

  const llmMessages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];
  for (const msg of history) {
    llmMessages.push({ role: msg.role, content: msg.content } as ChatMessage);
  }

  llmMessages.push({ role: "user", content: userMessage });

  await db.insert(messages).values({
    thread_id: threadId,
    role: "user",
    content: userMessage,
  });

  const tools = getRegisteredTools();

  while (true) {
    const response = await llmClient.chat.completions.create({
      model: llmClient._model,
      messages: llmMessages,
      tools:
        tools.length > 0
          ? (tools as OpenAI.Chat.Completions.ChatCompletionTool[])
          : undefined,
      tool_choice: tools.length > 0 ? "auto" : undefined,
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;

    if (!assistantMessage.tool_calls?.length) {
      const content = assistantMessage.content ?? "";

      await db.insert(messages).values({
        thread_id: threadId,
        role: "assistant",
        content,
      });

      return content;
    }

    llmMessages.push(assistantMessage);

    for (const toolCall of assistantMessage.tool_calls) {
      if (toolCall.type !== "function") continue;

      const toolResult = await executeTool(
        toolCall.function.name,
        toolCall.function.arguments,
      );

      llmMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResult,
      });

      await db.insert(messages).values({
        thread_id: threadId,
        role: "tool",
        content: toolResult,
        tool_call_id: toolCall.id,
        tool_name: toolCall.function.name,
      });
    }
  }
}
