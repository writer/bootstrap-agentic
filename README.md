# Chat Agent — Interview Starter

A chat agent with tool-calling capabilities, built with FastAPI, PostgreSQL, and
the OpenAI SDK.

## Prerequisites

- Docker & Docker Compose
- Node.js 24+ and [`pnpm`](https://npm.im/pnpm) *(auto-installed if missing)*
- [uv](https://docs.astral.sh/uv/) *(auto-installed if missing)*

## Quick Setup

```bash
./start.sh
```

This single command checks prerequisites (offering to install `node` and `uv` if
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
uv run pytest
```

> **Note:** 2 of 4 tests currently pass. This is expected — you'll address the
> failing tests during the interview.

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application
│   ├── config.py             # Settings (env vars)
│   ├── db.py                 # Database session setup
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic request/response schemas
│   ├── routers/              # API endpoints
│   ├── agent/
│   │   ├── loop.py           # Agent loop (LLM <> tool execution)
│   │   ├── prompts.py        # System prompts
│   │   └── tools/            # Tool registry & implementations
│   └── services/
│       └── llm.py            # LLM client configuration
├── frontend/                 # React/TypeScript chat UI
├── tests/                    # Test suite
├── docker-compose.yml        # Postgres + Redis
├── start.sh                  # One-command setup & run (macOS/Linux/WSL)
├── start.ps1                 # Windows launcher (validates WSL, runs start.sh)
└── pyproject.toml            # Python dependencies
```

## Troubleshooting

- **Docker not starting?** Make sure the ports in `.env` (`POSTGRES_PORT`,
  `REDIS_PORT`) are free on your machine.
- **Backend won't start?** Check that `.env` exists and `docker compose ps`
  shows healthy services.
- **Frontend not loading?** Make sure the backend is running on port 8000 (the
  frontend proxies API calls to it).
- **Tests failing?** 2 of 4 tests are expected to fail. If all 4 fail, check
  your Python environment (`uv sync --all-extras`).
