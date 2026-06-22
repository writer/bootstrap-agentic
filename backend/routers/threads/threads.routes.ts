import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import {
  ChatRequest,
  ChatResponse,
  ErrorDetail,
  ThreadCreate,
  ThreadIdParamsSchema,
  ThreadResponse,
} from "../../schemas/thread.js";

const tags = ["Threads"];

export const listThreads = createRoute({
  method: "get",
  path: "/",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(ThreadResponse),
      "List of threads",
    ),
  },
});

export const createThread = createRoute({
  method: "post",
  path: "/",
  tags,
  request: {
    body: jsonContentRequired(ThreadCreate, "Thread to create"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ThreadResponse, "Created thread"),
  },
});

export const getThread = createRoute({
  method: "get",
  path: "/{thread_id}",
  tags,
  request: {
    params: ThreadIdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ThreadResponse, "Thread details"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorDetail, "Thread not found"),
  },
});

export const chat = createRoute({
  method: "post",
  path: "/{thread_id}/chat",
  tags,
  request: {
    params: ThreadIdParamsSchema,
    body: jsonContentRequired(ChatRequest, "Chat message"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      ChatResponse,
      "Chat response with message history",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorDetail, "Thread not found"),
  },
});

export type ListThreadsRoute = typeof listThreads;
export type CreateThreadRoute = typeof createThread;
export type GetThreadRoute = typeof getThread;
export type ChatRoute = typeof chat;
