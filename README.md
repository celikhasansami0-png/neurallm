# NeuraLLM

Your company's AI operating system — a full-stack MVP: FastAPI backend, Next.js frontend,
Supabase (Postgres + Auth + pgvector) database, Groq LLM, Composio tool integrations, and a
3-layer LangGraph agent architecture (Router -> Orchestrator -> Executors).

```
neurallm/
├── backend/     FastAPI app (deploy to Render)
├── frontend/    Next.js 14 app (deploy to Vercel)
└── README.md    this file
```

This repo is code-complete but ships with no live credentials. Follow the steps below in
order — Supabase first, then Render, then Vercel — to get a working deployment.

---

## 1. Supabase (database + auth)

1. Go to https://supabase.com/dashboard and click **New project**. Pick a name (e.g.
   `neurallm`), a strong database password, and a region.
2. Once the project is provisioned, open **SQL Editor** and enable the `vector` extension
   if it isn't already (the migration below also does this, but you can verify under
   **Database → Extensions** by searching "vector" and toggling it on).
3. Open **SQL Editor → New query**, paste the contents of `backend/migrations/001_init.sql`,
   and run it. This creates all tables (`tenants`, `users`, `agents`, `tasks`, `tool_calls`,
   `recurring_tasks`, `workflows`, `integration_connections`, `knowledge_documents`,
   `knowledge_chunks` with a pgvector column, `audit_logs`) and enables Row Level Security
   with tenant-isolation policies on every tenant-scoped table.
4. Collect the values you'll need for the backend:
   - **Project Settings → Database → Connection string** (URI, "Transaction" pooler mode is
     fine for Render's free tier) → this is `DATABASE_URL`. Change the `postgresql://` prefix
     to `postgresql+asyncpg://` for SQLAlchemy's async driver.
   - **Project Settings → API → Project URL** → this is `SUPABASE_URL`.
   - **Project Settings → API → Project API keys → service_role secret** → this is
     `SUPABASE_SERVICE_KEY`. Keep this secret; it's used server-side only.
   - **Project Settings → API → Project API keys → anon public** → this is
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`, used by the frontend.

## 2. Render (backend)

1. Push this repo to GitHub.
2. Go to https://dashboard.render.com → **New → Blueprint**, and point it at your repo.
   Render will read `backend/render.yaml` and provision a Python web service named
   `neurallm-backend`. (If you prefer manual setup: **New → Web Service**, root directory
   `backend`, build command `pip install -r requirements.txt`, start command
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.)
3. Under the service's **Environment** tab, set the following variables (see
   `backend/.env.example` for the exact names):
   - `DATABASE_URL` — from Supabase step 4
   - `SUPABASE_URL` — from Supabase step 4
   - `SUPABASE_SERVICE_KEY` — from Supabase step 4
   - `GROQ_API_KEY` — create one at https://console.groq.com/keys
   - `COMPOSIO_API_KEY` — create one at https://app.composio.dev/settings
   - `SECRET_KEY` — generate with `openssl rand -hex 32`
   - `FRONTEND_URL` — your Vercel URL once deployed, e.g. `https://neurallm.vercel.app`
     (used for CORS; you can set this after step 3 and redeploy)
4. Deploy. Confirm it's healthy by visiting `https://<your-service>.onrender.com/health`.

## 3. Vercel (frontend)

1. Go to https://vercel.com/new and import the same GitHub repo. Set **Root Directory** to
   `frontend`. Vercel auto-detects the Next.js framework from `frontend/vercel.json`.
2. Under **Settings → Environment Variables**, set (see `frontend/.env.example`):
   - `NEXT_PUBLIC_API_URL` — your Render backend URL, e.g.
     `https://neurallm-backend.onrender.com`
   - `NEXT_PUBLIC_SUPABASE_URL` — from Supabase step 4
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase step 4
3. Deploy. Once live, copy the Vercel URL back into Render's `FRONTEND_URL` env var and
   redeploy the backend so CORS allows requests from your production frontend.
4. Visit your Vercel URL, click **Get started**, and sign up — this calls
   `POST /api/v1/auth/register`, which creates a tenant and seeds the 6 default agents
   (CEO, CEO Office, CTO, CFO, Product Manager, Software Engineer) via `backend/app/seed.py`.

---

## Local development

Backend:
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in local values
uvicorn app.main:app --reload
```

Frontend:
```bash
cd frontend
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at http://localhost:8000
npm install
npm run dev
```

## Known gaps before a production deploy

- `app/services/composio_service.py`, `embeddings.py`, and `orchestrator.py` fall back to
  deterministic stub behavior when `COMPOSIO_API_KEY` / `GROQ_API_KEY` aren't set — wire in
  real keys to get live tool calls and LLM planning.
- The frontend renders from `lib/mock-data.ts` in several pages (Dashboard, Assistant seed
  thread, Recurring, Approvals, Workflows, Knowledge, Integrations, ROI) — each usage is
  marked `// TODO: replace with live API call` and should be swapped for `lib/api.ts` calls
  once the backend has real data.
- No background job runner is included for recurring tasks (`cron_expression` on
  `recurring_tasks`) — add a scheduler (e.g. Render Cron Job or Supabase Edge Function) that
  calls into the orchestrator on schedule.
- Webhook delivery in `POST /api/v1/webhooks/test` is a stub — wire in a real outbound HTTP
  client (e.g. `httpx`) before relying on it.
- Auth uses a simple JWT + bcrypt flow in `backend/app/core/security.py` rather than
  Supabase Auth directly; swap in `supabase-py`'s auth client if you want Supabase to own
  user identity end-to-end.
