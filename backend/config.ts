import { env } from "./env.js";

export const settings = {
  postgresPort: env.POSTGRES_PORT,
  redisPort: env.REDIS_PORT,

  llmBaseUrl: env.LLM_BASE_URL,
  llmApiKey: env.LLM_API_KEY,
  llmModel: env.LLM_MODEL,

  get databaseUrl(): string {
    return `postgresql://interview:interview@localhost:${this.postgresPort}/interview`;
  },

  get redisUrl(): string {
    return `redis://localhost:${this.redisPort}`;
  },
};
