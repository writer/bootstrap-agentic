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
fi

# Check if API key is set
if grep -q "LLM_API_KEY=your-api-key-here" .env || grep -q "LLM_API_KEY=$" .env; then
    echo ""
    echo "    Enter your WRITER_API_KEY (from the email with task instructions):"
    read -r API_KEY
    if [ -z "$API_KEY" ]; then
        echo "    ⚠ No API key provided. Exiting."
        exit 1
    fi
    sed -i '' "s|LLM_API_KEY=.*|LLM_API_KEY=$API_KEY|" .env
    echo "    API key saved to .env"
else
    echo "    .env already configured"
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
