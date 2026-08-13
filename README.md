# Code Colleague

An AI-powered programming tutor for college/university students — a chat tutor, a code
debugger, and a code reviewer, built to teach rather than to hand over finished answers.

> **Learn to code. Don't just copy code.**

This is **Phases 1 & 2** of a staged build. The AI Tutor, Hint Mode, Code Debugger, Code Review,
Explain Code, Practice Generator, and Chat History are all fully functional end to end. The
Dashboard and Settings are scaffolded in the nav (marked "Phase 3") and described under
[Roadmap](#roadmap) below, ready to be built on top of this foundation.

---

## Features

- **AI Tutor** — a chat interface for programming questions (errors, concepts, algorithms,
  "explain this code"). Adjusts explanations to a Beginner / Intermediate / Advanced level you
  pick per conversation, and defaults to hinting rather than solving homework-style questions
  outright.
- **Hint Mode** — toggle it on in the AI Tutor and describe what you're stuck on. Instead of a
  straight answer, you get a progressive **Hint 1 → Hint 2 → Hint 3 → Solution** ladder — each
  hint revealed one click at a time, solution last.
- **Code Debugger** — paste code (+ optional error message and expected behavior) in Python,
  Java, C++, or C. Returns a structured **Problem → Why it happens → Hint → Suggested fix**
  walkthrough; the fix is only revealed when you ask for it, visualized with the same
  progressive "hint ladder."
- **Code Review** — paste code, get severity-tagged findings (🔴 Critical / 🟠 Warning /
  🟡 Improvement / 🔵 Suggestion), each with a location, explanation, and concrete suggestion —
  not a silent full rewrite.
- **Explain Code** — paste a snippet and get a high-level summary, inputs/outputs, edge cases,
  time/space complexity, and (in Detailed mode) a chunk-by-chunk walkthrough.
- **Practice Question Generator** — pick a language, topic, difficulty, and count; get original
  practice problems with example I/O and constraints. Hints (2 per question, progressive) and
  the solution stay hidden until you click for them.
- **Chat History** — every AI Tutor conversation is saved and browsable, with a "Continue this
  conversation" link back into the Tutor.

## Tech Stack

**Frontend** — Next.js 14 (App Router) · TypeScript · Tailwind CSS · Monaco Editor · lucide-react

**Backend** — FastAPI · Pydantic v2 · SQLAlchemy 2.0 · Alembic

**Database** — PostgreSQL

**AI** — Provider-agnostic `LLMProvider` abstraction (Groq by default — free tier — or OpenAI),
configured entirely through environment variables. No API keys are hard-coded anywhere.

## Architecture

```
                     ┌──────────────────────┐
                     │   Next.js frontend   │
                     │  (Tutor / Debugger /  │
                     │   Review UIs)          │
                     └──────────┬───────────┘
                                │ REST (JSON)
                     ┌──────────▼───────────┐
                     │    FastAPI backend    │
                     │  api/  →  services/   │
                     └─────┬────────────┬────┘
                           │            │
                 services/ai/     services/llm/
              (tutor, debugger,   (LLMProvider
               reviewer — build     abstraction:
               prompts, validate    Groq / OpenAI)
               JSON responses)
                           │
                     ┌─────▼─────┐
                     │ PostgreSQL │
                     └───────────┘
```

The AI logic is deliberately kept out of the API route handlers: routes in `app/api/` just
validate the request, call into `app/services/ai/`, persist an activity record, and return the
(already-validated) response. Each `services/ai/*.py` module owns one feature's system prompt and
its expected JSON shape, which is parsed and validated against a Pydantic schema before it ever
reaches the frontend — the app never trusts raw LLM output.

## Project Structure

```
code-colleague/
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI routes (health, tutor, debugger, review)
│   │   ├── core/           # settings, DB engine/session
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── ai/         # per-feature prompts + JSON validation
│   │   │   └── llm/        # LLMProvider abstraction (base, groq, openai, factory)
│   │   └── main.py
│   ├── alembic/             # migration scaffolding (Phase 1 uses create_all at startup)
│   ├── tests/                # pytest, LLM calls mocked
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # AppShell, HintLadder, CodeEditor, etc.
│   │   ├── lib/              # API client, theme provider
│   │   └── types/
│   ├── Dockerfile
│   └── .env.local.example
├── docker-compose.yml
└── README.md
```

## Setup

### Option A — Docker (recommended)

```bash
cp backend/.env.example backend/.env
# then edit backend/.env and add your GROQ_API_KEY (see below)

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

### Option B — Run locally without Docker

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then add your GROQ_API_KEY
# requires a local Postgres reachable at DATABASE_URL in .env
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

## Environment Variables

**`backend/.env`** (see `backend/.env.example`)

| Variable | Description |
|---|---|
| `LLM_PROVIDER` | `groq` (default) or `openai` |
| `GROQ_API_KEY` | Free key from [console.groq.com/keys](https://console.groq.com/keys) |
| `GROQ_MODEL` | Defaults to `llama-3.3-70b-versatile` |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | Only needed if `LLM_PROVIDER=openai` |
| `DATABASE_URL` | Postgres connection string |
| `CORS_ORIGINS` | Comma-separated allowed origins for the frontend |

**`frontend/.env.local`** (see `frontend/.env.local.example`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL, e.g. `http://localhost:8000/api/v1` |

Never commit real `.env` / `.env.local` files — both are already in `.gitignore`.

## Adding a new LLM provider

1. Create `backend/app/services/llm/<provider>.py` implementing the `LLMProvider` interface
   (`base.py`) — two methods, `complete()` and `chat()`.
2. Register it in `backend/app/services/llm/factory.py`.
3. Add its config fields to `backend/app/core/config.py` and `.env.example`.

No other file needs to change — every feature calls `get_llm_provider()`, never a vendor SDK
directly.

## Adding a new debugger language

The debugger prompt is language-agnostic; add the language to `Language` in
`app/schemas/common.py`, add it to `SUPPORTED_LANGUAGES` in `app/api/debugger.py`, and add the
matching Monaco language id in `frontend/src/components/CodeEditor.tsx`.

## Testing

```bash
cd backend
pytest
```

All LLM calls are mocked via a `FakeLLMProvider` fixture (`tests/conftest.py`) so the suite never
hits a real API or consumes credits. Covers: the health endpoint, the tutor endpoint (including
session-id handling and malformed-LLM-output handling), the debugger endpoint (including the
hide-fix-until-requested behavior), the review endpoint (including schema-validation failures),
the hint endpoint (hide/reveal-solution behavior), the explain endpoint (quick vs. detailed
line-by-line), the practice endpoint (question count validation), and chat history (listing
sessions, fetching a transcript, 404 on an unknown session).

## API Overview

All routes are under `/api/v1`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service status + active LLM provider |
| `POST` | `/tutor` | Chat with the AI tutor |
| `GET` | `/tutor/sessions` | List past chat sessions, most recent first |
| `GET` | `/tutor/sessions/{id}` | Full transcript for one chat session |
| `GET` | `/debugger/languages` | Supported debugger languages |
| `POST` | `/debugger` | Structured debugging walkthrough |
| `POST` | `/review` | Structured, severity-tagged code review |
| `POST` | `/hint` | Progressive hint ladder (Hint 1/2/3 + gated solution) |
| `POST` | `/explain` | Code explanation (quick or detailed) |
| `POST` | `/practice` | Generate practice questions for a topic/difficulty |

Full interactive docs (request/response schemas, try-it-out) at `/docs` once the backend is
running.

## Roadmap

- **Phase 3** — Student Dashboard (recent activity, weak-topic detection sourced from the
  `learning_activity` table already being written to by every feature), user profiles, settings.
- **Phase 4** — RAG over uploaded course notes/lecture PDFs, a sandboxed code execution
  environment, GitHub integration, personalized learning paths, more languages.



