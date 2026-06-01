# Chat Agent — Interview Starter

A chat agent with tool-calling capabilities, built with FastAPI, PostgreSQL, and
the OpenAI SDK.

## Prerequisites

- Python 3.11+
- Docker & Docker Compose
- Node.js 24+ and [`pnpm`](https://npm.im/pnpm)
- [uv](https://docs.astral.sh/uv/) (Python package manager)

## Windows

Use WSL2. Run all commands from a WSL2 terminal, and **clone this repo inside
WSL2** (e.g. `~/bootstrap-agentic`), not on your Windows drive (`/mnt/c/...`).
Docker Desktop must have WSL2 integration enabled for your distro.

## Quick Setup

```bash
./start.sh
```

This single command installs dependencies, prompts for your API key (provided in
the email with task instructions), starts Docker, and launches the backend +
frontend.

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
├── start.sh                  # One-command setup & run
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
