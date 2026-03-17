# Chat Agent — Interview Starter

A chat agent with tool-calling capabilities, built with FastAPI, PostgreSQL, and the OpenAI SDK.

## Prerequisites

- Python 3.11+
- Docker & Docker Compose
- Node.js 20+ and pnpm
- [uv](https://docs.astral.sh/uv/) (Python package manager)

## Quick Setup

```bash
./start.sh
```

On first run, this installs dependencies and creates `.env` from the example. Add your API key to `.env` (it will be provided in the email with task instructions), then run `./start.sh` again — it will start Docker, the backend, and the frontend all at once.

Open [http://localhost:3000](http://localhost:3000) to verify the chat interface loads. Press `Ctrl+C` to stop everything.

## Run tests

```bash
uv run pytest
```

> **Note:** 2 of 4 tests currently pass. This is expected — you'll address the failing tests during the interview.

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

- **Docker not starting?** Make sure ports 5432 and 6379 are free.
- **Backend won't start?** Check that `.env` exists and `docker compose ps` shows healthy services.
- **Frontend not loading?** Make sure the backend is running on port 8000 (the frontend proxies API calls to it).
- **Tests failing?** 2 of 4 tests are expected to fail. If all 4 fail, check your Python environment (`uv sync --all-extras`).
