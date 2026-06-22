import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { cleanEnv, port, str } from "envalid";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
config({ path: path.join(repoRoot, ".env") });

export const env = cleanEnv(process.env, {
  POSTGRES_PORT: port({ default: 5432 }),
  REDIS_PORT: port({ default: 6380 }),
  LLM_BASE_URL: str({ default: "https://api.writer.com/v1" }),
  LLM_API_KEY: str(),
  LLM_MODEL: str({ default: "palmyra-x5" }),
});
