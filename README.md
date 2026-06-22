# Chat Agent — Interview Starter

A chat agent with tool-calling capabilities, built with Hono, Drizzle ORM,
PostgreSQL, and the OpenAI SDK.

## Prerequisites

- Docker & Docker Compose
- Node.js 24+ and [`pnpm`](https://npm.im/pnpm) *(auto-installed if missing)*

## Quick Setup

```bash
./start.sh
```

This single command checks prerequisites (offering to install `node` if
missing), prompts for your API key, starts Docker, and launches the backend +
frontend.

## Windows

From PowerShell, run:

```powershell
.\start.ps1
```

This validates WSL2, Docker, and distro setup, then launches `start.sh` inside
WSL automatically. For best performance, clone the repo inside WSL
(`~/bootstrap-agentic`) rather than on your Windows drive (`/mnt/c/...`).

Open [http://localhost:3000](http://localhost:3000) to verify the chat interface
loads. Press `Ctrl+C` to stop everything.

## Run tests

```bash
pnpm test
```

> **Note:** 2 of 4 tests currently pass. This is expected — you'll address the
> failing tests during the interview.

## Lint & format

```bash
pnpm lint        # check for issues
pnpm lint:fix    # auto-fix issues
```

## Project Structure

```
├── backend/
│   ├── main.ts              # Hono application
│   ├── config.ts            # Settings (env vars)
│   ├── db.ts                # Drizzle ORM setup
│   ├── models/              # Drizzle table definitions
│   ├── schemas/             # Zod request/response schemas
│   ├── routers/             # API endpoints
│   ├── tests/               # Test suite (Vitest)
│   ├── agent/
│   │   ├── loop.ts          # Agent loop (LLM <> tool execution)
│   │   ├── prompts.ts       # System prompts
│   │   └── tools/           # Tool registry & implementations
│   └── services/
│       └── llm.ts           # LLM client configuration
├── frontend/                # React/TypeScript chat UI
├── docker-compose.yml       # Postgres + Redis
├── start.sh                 # One-command setup & run (macOS/Linux/WSL)
├── start.ps1                # Windows launcher (validates WSL, runs start.sh)
├── biome.jsonc              # Biome linter/formatter config
├── pnpm-workspace.yaml      # pnpm workspace definition
└── package.json             # Root orchestrator (Biome, Husky)
```

## Troubleshooting

- **Docker not starting?** Make sure the ports in `.env` (`POSTGRES_PORT`,
  `REDIS_PORT`) are free on your machine.
- **Backend won't start?** Check that `.env` exists and `docker compose ps`
  shows healthy services.
- **Frontend not loading?** Make sure the backend is running on port 8000 (the
  frontend proxies API calls to it).
- **Tests failing?** 2 of 4 tests are expected to fail (schema bug and missing route). Tests use an in-memory database and do not require Docker.
