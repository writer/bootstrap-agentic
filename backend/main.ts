import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { migrateDb, pool } from "./db.js";
import { router as threadsRouter } from "./routers/threads/threads.index.js";

export const app = new OpenAPIHono({ strict: false });

app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["*"],
    allowHeaders: ["*"],
    credentials: true,
  }),
);

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["System"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ status: z.string() }),
      "Health check",
    ),
  },
});

app.openapi(healthRoute, (c) => {
  return c.json({ status: "ok" }, 200);
});

app.route("/threads", threadsRouter);

app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    title: "Chat Agent API",
    version: "0.1.0",
    description: "Chat agent with tool-calling capabilities",
  },
});

app.get("/ui", swaggerUI({ url: "/doc" }));

const isMainModule =
  process.argv[1]?.endsWith("main.ts") ||
  process.argv[1]?.includes("backend/main");

if (isMainModule) {
  migrateDb().then(() => {
    const port = 8000;
    console.log(`Server is running on http://localhost:${port}`);
    serve({ fetch: app.fetch, port });
  });
}

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});
