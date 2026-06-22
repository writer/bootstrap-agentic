import { z } from "@hono/zod-openapi";

export const ErrorDetail = z.object({
  detail: z.string(),
});

export const ThreadIdParamsSchema = z.object({
  thread_id: z
    .string()
    .uuid()
    .openapi({
      param: { name: "thread_id", in: "path", required: true },
      example: "4651e634-a530-4484-9b09-9616a28f35e3",
    }),
});

export const ThreadCreate = z.object({
  title: z.string().default("New Chat"),
});

export const ThreadResponse = z.object({
  id: z.string(),
  title: z.string(),
  created_at: z.coerce.date(),
});

export const MessageCreate = z.object({
  content: z.string(),
});

export const MessageResponse = z.object({
  id: z.string(),
  thread_id: z.string(),
  role: z.string(),
  // BUG: should be z.string() — content is stored as text in the database
  content: z.number(),
  tool_call_id: z.string().nullable().optional(),
  tool_name: z.string().nullable().optional(),
  created_at: z.coerce.date(),
});

export const ChatRequest = z.object({
  message: z.string(),
});

export const ChatResponse = z.object({
  thread_id: z.string(),
  response: z.string(),
  messages: z.array(MessageResponse),
});

export type ThreadCreateType = z.infer<typeof ThreadCreate>;
export type ThreadResponseType = z.infer<typeof ThreadResponse>;
export type MessageCreateType = z.infer<typeof MessageCreate>;
export type MessageResponseType = z.infer<typeof MessageResponse>;
export type ChatRequestType = z.infer<typeof ChatRequest>;
export type ChatResponseType = z.infer<typeof ChatResponse>;
