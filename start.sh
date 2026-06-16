#!/usr/bin/env bash
set -o pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

confirm() {
  local prompt="$1"

  while true; do
    read -rp "    $prompt [y/n]: " yn
    case "$yn" in
      [Yy]*) return 0 ;;
      [Nn]*) return 1 ;;
      *) echo "    Please answer y or n." ;;
    esac
  done
}

exists() {
  command -v "$1" > /dev/null 2>&1

  if [ $? -ne 0 ]; then
    echo "    $1 is not installed. Please install it and try again."
    exit 1
  fi

  echo "    $1 is installed"
}

cleanup() {
    echo "==> Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "    Done"
}

trap cleanup EXIT

exists "docker"

if ! command -v node > /dev/null 2>&1; then
  echo "    node is not installed."
  
  if confirm "Install node via nvm now?"; then
    export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash
    # nvm is a shell function, not a binary -- source it directly rather than
    # re-sourcing an rc file (which varies by shell: .bashrc, .zshrc, etc.).
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    nvm install --lts

    if ! command -v node > /dev/null 2>&1; then
      echo "    node installation failed. Please install it manually and try again."
      exit 1
    fi

    echo "    node installed successfully"
    npm i -g corepack
    corepack enable
  else
    echo "    node is required. Exiting."
    exit 1
  fi
fi

if ! command -v uv > /dev/null 2>&1; then
  echo "    uv is not installed."

  if confirm "Install uv now?"; then
    curl -LsSf https://astral.sh/uv/install.sh | sh
    # The installer creates a sourceable env file; fall back to well-known paths.
    if [ -f "$HOME/.local/bin/env" ]; then
      \. "$HOME/.local/bin/env"
    else
      export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
    fi

    if ! command -v uv > /dev/null 2>&1; then
      echo "    uv installation failed. Please install it manually and try again."
      exit 1
    fi

    echo "    uv installed successfully"
  else
    echo "    uv is required. Exiting."
    exit 1
  fi
else
  echo "    uv is installed"
fi

echo "==> Installing backend dependencies..."

if ! [ -d .venv ]; then
  uv venv
  source .venv/bin/activate
fi

uv sync --all-extras

echo ""
echo "==> Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
pnpm install
cd "$SCRIPT_DIR"

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
    sed -i "s|LLM_API_KEY=.*|LLM_API_KEY=$API_KEY|" .env
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
