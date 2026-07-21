# AGENTS.md — E-Companion

> Primary reference for all agents and humans working on this project.
> Read this at the start of every session. Keep it short and accurate — it is not a tutorial.

---

## Project

Pet care companion app. Users manage pets, schedule feeding/care reminders, and log health events.

- **Live URL**: https://companion.postiusgroup.com
- **Repo**: https://github.com/nilpost/E-Companion
- **Owner**: nilpost

---

## Session files — read all three at session start

| File | Purpose |
|------|---------|
| `AGENTS.md` | Stack, conventions, agent registry (this file) |
| `STATUS.md` | Current sprint, in-progress items, blockers, decisions log |
| `BACKLOG.md` | All tasks P0 (blocking) → P3 (someday) |

**PO agent**: reads all three + `git log --oneline -10` before doing anything. Updates `STATUS.md` and `BACKLOG.md` and commits them at end of session.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| Backend | Express.js + Node.js (ESM modules) |
| Real-time | WebSockets (ws) |
| Auth | Passport.js — session-based (not JWT) |
| ORM | Drizzle ORM |
| Database | PostgreSQL via Supabase |
| Hosting | Railway — auto-deploys from `main` branch |
| DNS / CDN | Cloudflare — `companion.postiusgroup.com` |

---

## Key file paths

```
shared/
  schema.ts           ← Drizzle schema — single source of truth for DB shape
  types.ts            ← shared TypeScript types (client + server)

server/
  index.ts            ← entry point
  routes.ts           ← ALL API route definitions
  auth.ts             ← Passport.js config, isAuthenticated middleware
  storage.ts          ← ALL Drizzle queries (no DB calls in routes)
  db.ts               ← DB connection (Drizzle + pg)
  vite.ts             ← Vite dev server (dev only) + serveStatic (prod)

client/src/
  pages/              ← route-level components (one per page)
  components/         ← reusable UI components
  hooks/              ← custom React hooks
  lib/                ← utilities, API client

.claude/agents/       ← agent definitions (all agents live here)
nixpacks.toml         ← Railway build config
```

---

## Database

| Setting | Value |
|---------|-------|
| Provider | Supabase |
| Project ref | `ynegbxsokzonsjrandyi` |
| Region | AWS ap-northeast-1 |
| Schema file | `shared/schema.ts` |
| Migration style | Push-based (`npx drizzle-kit push`) — no migration files |
| Runtime connection | `DATABASE_URL` env var |
| Migration connection | `DATABASE_URL_DIRECT` env var (bypasses Supabase pooler) |

---

## Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | yes | Supabase connection string (pooled) |
| `DATABASE_URL_DIRECT` | migrations only | Direct connection — use for `drizzle-kit push`. **As of 2026-07-21, `drizzle.config.ts` code reads this correctly (PR #14), but the value itself still needs to be set in Railway's service variables — see STATUS.md blockers / BACKLOG.md INFRA-06.** |
| `SESSION_SECRET` | yes | Passport session secret — must be long random string in prod |
| `NODE_ENV` | yes | `production` on Railway, `development` locally |
| `PORT` | no | Railway sets this automatically; defaults to 5000 locally |

Never hardcode these. Never commit `.env`.

---

## Build & deploy

```bash
# Install (Railway uses this — includes devDeps needed for build)
npm install --include=dev

# Build (Vite for client + esbuild for server)
npm run build

# Start (production)
npm run start

# Local dev
npm run dev
```

**Railway specifics**:
- Auto-deploys on push to `main`
- `nixpacks.toml` overrides install to `npm install --include=dev`
- Node 18 on Railway — do NOT use `import.meta.dirname` (Node 21+ only)
- Use `fileURLToPath(import.meta.url)` or `process.cwd()` instead

**Verifying a deploy went live**: Claude Code web/agent sessions run behind an outbound network allowlist that does NOT include `companion.postiusgroup.com` by default — `curl`/`WebFetch` to the live URL will 403 at the proxy, not at the app. Don't report this as "site is down"; report it as "cannot verify from this sandbox" and ask the human to check the Railway dashboard, or to widen the session's network policy (see https://code.claude.com/docs/en/claude-code-on-the-web) if live verification is needed repeatedly.

---

## Postmortems / Learnings

> Durable lessons from real incidents. Add an entry when a bug reveals a pattern likely to recur — not for routine fixes.

- **2026-07-17 — Unhandled promise rejections crash the whole process (BUG-01 / HARDEN-01)**: Any `async` Express handler (route handler, or a callback library like `passport-local` that doesn't await/catch its callback) whose rejection is never caught becomes an unhandled promise rejection. Node exits on this by default, and Railway's `ON_FAILURE` restart policy then serves 502s to *every* user until it restarts — not just the one request that failed. Fix pattern: never leave an `async` callback unguarded.
  - `server/auth.ts`: passport callbacks (`LocalStrategy` verify, `deserializeUser`) now wrap their bodies in try/catch and resolve errors via `done(err)`.
  - `server/routes.ts`: all route handlers go through the `asyncHandler` wrapper (top of file), which forwards rejections to `next(err)` → the global error middleware in `server/index.ts`. **Any new route added to this file must use `asyncHandler`.**
  - General rule: a raw `async (req, res) => {...}` route handler with no `asyncHandler`/try-catch is a bug, not a style choice.
- **2026-07-21 — Docs can describe env-var wiring that the code never implements (ENV-01)**: `AGENTS.md`/`BOOTSTRAP.md` documented `DATABASE_URL_DIRECT` as "the migration connection," but `drizzle.config.ts` only ever read `DATABASE_URL` — so every `drizzle-kit push` silently ran through the Supabase pooler, and the docs were describing an intent, not a fact. Same audit also found `SESSION_SECRET` read via a `!` non-null assertion (crashes with a cryptic express-session error on a missing var) instead of the fail-fast guard pattern already used for `DATABASE_URL` in `server/db.ts`. Fixed in PR #14. General rule: when a config table in AGENTS.md names a specific env var for a specific purpose, treat that as a claim to verify against the actual code path (`grep` for `process.env.<VAR>`), not a fact to take on faith — doc and code drift silently because nothing fails loudly when a fallback (the pooler, a stale assertion) papers over the gap. `infra-admin`/`devops` env-var audits should grep for each documented var's actual usage site, not just its presence in `.env.example`.

---

## Auth conventions

- Session-based via Passport.js — `req.user` is set on authenticated requests
- `isAuthenticated` middleware in `server/auth.ts` — apply to all protected routes
- Auth API routes (no middleware needed): `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/user`
- All other `/api/*` routes must have `isAuthenticated`
- Always check `WHERE user_id = req.user.id` on queries — users must not access each other's data

---

## Code conventions

- TypeScript strict mode throughout
- All DB queries in `server/storage.ts` — routes call storage functions, nothing else
- API response shape: `{ data: ... }` on success, `{ message: "..." }` on error
- No comments unless the WHY is non-obvious (not the what)
- No `import.meta.dirname` — use `fileURLToPath(import.meta.url)` or `process.cwd()`
- No raw SQL strings — use Drizzle query builder

---

## Agent registry

These 9 agents originated in this repo and are now also published as `studio-core` in
[`nilpost/claude-code-studio`](https://github.com/nilpost/claude-code-studio) — a git-hosted
Claude Code plugin marketplace that distributes the same agents (generalized to any stack) to
every other project, plus a shared, incrementally-growing `knowledge/LEARNINGS.md`. This repo
consumes that marketplace via `.claude/settings.json` (`extraKnownMarketplaces` +
`enabledPlugins`), but its own `.claude/agents/*.md` still take priority for E-Companion-specific
behavior — the marketplace copies are the generic fallback everyone else gets. See `po.md`'s
"Learning cycle" for how a lesson decides whether it stays local or goes to the shared base.

| Agent | Model | Trigger — use when... |
|-------|-------|----------------------|
| `po` | Sonnet 5 | Starting any goal. Reads session files, orchestrates, updates them on exit. |
| `backlog` | Haiku 4.5 | Adding or refining items in BACKLOG.md |
| `feature-planning` | Sonnet 5 | Designing a feature before any code is written |
| `code-review` | Sonnet 5 | Reviewing a diff or set of changed files before merge |
| `qa` | Haiku 4.5 | Writing tests for a completed scope |
| `devops` | Haiku 4.5 | Diagnosing build failures, deploy issues, env config |
| `infra-admin` | Haiku 4.5 | Auditing Cloudflare, Supabase, Railway, or env var completeness |
| `docs` | Haiku 4.5 | Generating architecture diagrams, API reference, schema docs |
| `security` | Sonnet 5 | OWASP audit, auth review, access control check |

### Invocation examples

```
# Via PO (recommended for multi-step goals)
@po implement feeding reminder CRUD end-to-end

# Direct (for narrow, single-agent tasks)
@feature-planning add health event logging for pets
@code-review review server/routes.ts and server/storage.ts
@qa write tests for the auth flow in server/auth.ts
@devops diagnose why Railway build is failing
@infra-admin audit env vars against .env.example
@docs generate architecture diagram and API reference
@security run full OWASP audit on the API layer
@backlog surface backlog items from the health logging feature
```

### Token optimization rules (all agents follow these)
- Read only files relevant to the task — never scan the full codebase
- Pass file paths to sub-agents, not file contents
- Haiku for mechanical/structured tasks; Sonnet for judgment-heavy tasks
- Parallelize independent tasks (e.g. QA + backlog update after a feature ships)
