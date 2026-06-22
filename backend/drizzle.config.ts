import { defineConfig } from "drizzle-kit";
import { env } from "./env.js";

export default defineConfig({
  out: "./drizzle",
  schema: "./models/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: `postgresql://interview:interview@localhost:${env.POSTGRES_PORT}/interview`,
  },
});
