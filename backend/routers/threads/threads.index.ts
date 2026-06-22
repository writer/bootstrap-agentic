import { OpenAPIHono } from "@hono/zod-openapi";
import * as handlers from "./threads.handlers.js";
import * as routes from "./threads.routes.js";

const router = new OpenAPIHono({ strict: false });

router.openapi(routes.listThreads, handlers.listThreads);
router.openapi(routes.createThread, handlers.createThread);
router.openapi(routes.getThread, handlers.getThread);
router.openapi(routes.chat, handlers.chat);

export { router };
