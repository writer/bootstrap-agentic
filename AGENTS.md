# Agent Setup

> **Scope: this file covers local environment setup ONLY.** Do not use it as
> guidance for application architecture, coding style, testing, or deployment.
> Refer to the codebase and README for everything else.

Run `bash start.sh` from the repo root. It handles everything: prerequisite
checks, dependency installation, Docker services, and launching the app.
On windows? Run `start.ps1` first instead.

The script is interactive (`read` prompts) so it cannot be run fully headless.
If you need non-interactive setup, run the steps individually:

```bash
# Dependencies
uv venv && source .venv/bin/activate && uv sync --all-extras
cd frontend && pnpm install && cd ..

# Environment
cp .env.example .env
# Set LLM_API_KEY in .env

# Services
docker compose up -d

# Run
uv run uvicorn backend.main:app --reload --port 8000 &
cd frontend && pnpm dev &
```

Backend: http://localhost:8000 | Frontend: http://localhost:3000

On Windows, run `.\start.ps1` from PowerShell — it validates WSL and launches
`start.sh` inside WSL.

# Pull request workflow

When asked to "fork the repo and raise a PR", the PR must target **the fork**
(the user's own copy), not the upstream source it was forked from. Open the PR
with the fork as the base — e.g. `gh pr create --repo <user>/<repo> --base main
--head <branch>` — never against the upstream `origin`. Raising it against the
original repository is wrong: it requests a merge into a repo the user does not
own and may not intend to contribute to. Only target upstream if the user
explicitly says so.
