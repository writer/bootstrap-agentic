#!/usr/bin/env bash
set -e

cleanup() {
    echo ""
    echo "==> Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "    Done"
}
trap cleanup EXIT

echo "==> Installing backend dependencies..."
uv sync --all-extras

echo ""
echo "==> Installing frontend dependencies..."
cd frontend && pnpm install && cd ..

echo ""
echo "==> Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "    Created .env from .env.example"
    echo "    ⚠ Add your API key to .env (provided in the email with task instructions) and re-run this script"
    exit 0
else
    echo "    .env already exists"
fi

echo ""
echo "==> Starting Docker services (Postgres + Redis)..."
docker compose up -d

echo ""
echo "==> Waiting for Postgres to be ready..."
until docker compose exec -T postgres pg_isready -U interview > /dev/null 2>&1; do
    sleep 1
done
echo "    Postgres is ready"

echo ""
echo "==> Starting backend on http://localhost:8000..."
uv run uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!

echo "==> Starting frontend on http://localhost:3000..."
cd frontend && pnpm dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo "  App is running!"
echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "  Press Ctrl+C to stop"
echo "============================================"

wait
