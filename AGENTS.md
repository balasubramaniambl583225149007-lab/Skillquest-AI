# AGENTS.md — Skill Quest AI

Repository-specific knowledge for agent sessions.

## Layout
- `backend/` — FastAPI + SQLAlchemy (async) microservice.
  - `app/main.py` — entrypoint; routers live in `app/routes/*` and are re-exported from `app/routers/*` (keep both paths working).
  - `app/db/` — `models.py` (ORM), `database.py` (engine), `seed_curriculum.py` (seed data).
  - `app/services/socratic_tutor.py` — Spike intent classifier + persona orchestration.
  - `app/simulation/` — deterministic SPICE / code-sandbox / truth-table engines.
  - Fallback DB is `sqlite+aiosqlite:///./skillquest.db`; Postgres via `DATABASE_URL`.
- `frontend/` — React 19 + Vite + Tailwind v4 (via `@tailwindcss/vite`).
  - Global CSS is `src/index.css` (imports Tailwind). **`src/App.css` is dead/unused.**
  - `src/utils/soundManager.ts` — Howler.js audio engine; samples in `public/sounds/*.mp3`.
  - `src/components/ForestBackground.tsx` — reusable decorative jungle canvas.
  - `vite.config.ts` proxies `/api` -> `http://127.0.0.1:8000`.

## Commands
- Backend tests: `python -m pytest backend/tests/ backend/test_suite.py -q` (needs `fastapi`, `sqlalchemy`, `httpx`, `pytest`, `pytest-asyncio`).
- Frontend: `npm run typecheck`, `npm run build`, `npm run lint` (oxlint).
- Dev servers: backend `python -m uvicorn app.main:app --port 8000`; frontend `npm run dev -- --port 12000 --host 0.0.0.0`.
- Work-host access requires `server.allowedHosts: ['.prod-runtime.all-hands.dev']` in `vite.config.ts`.

## Deployment (Render backend + Vercel frontend + Supabase Postgres)
- Render: service `https://skillquest-ai-kwlj.onrender.com`, root `backend/`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`; env `DATABASE_URL`, `GEMINI_API_KEY`, `GEMINI_PRO_MODEL`, `GEMINI_FLASH_MODEL`.
- Vercel: project root `frontend/`; `frontend/vercel.json` rewrites `/api/:path*` to the Render URL and SPA-fallbacks to `index.html`; env `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- `init_db()` runs `create_all` then `_reconcile_schema()`, which `ADD COLUMN`s any ORM column missing from a pre-existing table. This self-heals drift between `schema.sql`/models and an already-provisioned Supabase DB.
- Schema drift found in prod (2026-10-11): `public.profiles.avatar_url` was missing in Supabase, so `select(Profile)` raised `UndefinedColumn` and `/api/v1/user/profile`, `/api/v1/mascot/outfits`, and `/api/v1/analytics/league` all returned 500. Fixed by `supabase/migrations/20261011_add_profile_avatar_url.sql` and the startup reconcile.
- Supabase pooler: use the session pooler (port 5432) or direct connection for asyncpg; transaction pooler (6543) breaks prepared statements.

## Conventions / gotchas
- Both `app/routes/*` (implementation) and `app/routers/*` (re-export shims) exist; edit the `app/routes/*` files.
- `seed_database()` populates levels/notes/quests; endpoints return safe 200 fallbacks when data is unseeded — never 404.
- Spike `classify_intent` uses a regex fast-pass then an optional Gemini call with a 1.4s timeout. Keep the 8 intent constants stable.
- Jungle UI theme: emerald/amber palette, `adventure-card` class, `btn-3d-primary`/`btn-3d-secondary` CTAs, forest keyframes in `index.css`.
- Audio samples are generated with ffmpeg (no external assets); `soundManager` has a Web Audio synth fallback on load/play error.
