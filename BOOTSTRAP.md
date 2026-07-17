# BOOTSTRAP — New session quick-start prompt

> Paste the block below into a new Claude Code context window to resume work instantly.
> Replace the last line with your actual goal before sending.

---

```
I'm working on E-Companion, a pet care app deployed at https://companion.postiusgroup.com.
Repo: https://github.com/nilpost/E-Companion

## Session files — read all three before doing anything
- AGENTS.md   → stack, env vars, conventions, full agent registry with invocation examples
- STATUS.md   → current sprint goal, in-progress items, blockers, decisions log
- BACKLOG.md  → all tasks P0 (blocking) → P3 (someday)

## Stack
| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Frontend   | React 18 + TypeScript + Vite + Tailwind + shadcn/ui |
| Backend    | Express.js + Node.js (ESM)                        |
| Real-time  | WebSockets                                        |
| Auth       | Passport.js — session-based, not JWT              |
| ORM        | Drizzle ORM                                       |
| Database   | PostgreSQL via Supabase                           |
| Hosting    | Railway — auto-deploys from main                  |
| DNS        | Cloudflare → companion.postiusgroup.com           |

## Key file paths
- shared/schema.ts       → Drizzle schema (single source of truth for DB)
- shared/types.ts        → shared TypeScript types
- server/routes.ts       → ALL API route definitions
- server/auth.ts         → Passport config + isAuthenticated middleware
- server/storage.ts      → ALL Drizzle queries (no DB calls in routes)
- server/db.ts           → DB connection
- client/src/pages/      → route-level React components
- client/src/components/ → reusable UI components
- client/src/hooks/      → custom React hooks
- .claude/agents/        → all agent definitions

## Environment variables
| Variable             | Required       | Notes                                      |
|----------------------|----------------|--------------------------------------------|
| DATABASE_URL         | yes            | Supabase pooled connection                 |
| DATABASE_URL_DIRECT  | migrations only| Use with drizzle-kit push                  |
| SESSION_SECRET       | yes            | Long random string in prod                 |
| NODE_ENV             | yes            | production on Railway, development locally |
| PORT                 | no             | Railway sets automatically; default 5000   |

## Conventions
- Session-based auth — req.user set by Passport on authenticated requests
- isAuthenticated middleware required on all /api/* routes except auth routes
- Always filter by user_id: WHERE user_id = req.user.id (no cross-user data access)
- All DB queries in server/storage.ts — routes call storage functions only
- API responses: { data } on success / { message } on error
- No import.meta.dirname (Node 18) — use fileURLToPath(import.meta.url) or process.cwd()
- Migrations: npx drizzle-kit push (push-based, no migration files)

## Agent system — 9 specialists in .claude/agents/
| Agent           | Model     | Use when...                                     |
|-----------------|-----------|-------------------------------------------------|
| po              | Sonnet 5  | Starting any multi-step goal — reads all session files, orchestrates, updates them on exit |
| backlog         | Haiku 4.5 | Adding or refining items in BACKLOG.md          |
| feature-planning| Sonnet 5  | Designing a feature before any code is written  |
| code-review     | Sonnet 5  | Reviewing a diff or changed files before merge  |
| qa              | Haiku 4.5 | Writing tests for a completed scope             |
| devops          | Haiku 4.5 | Diagnosing build failures, deploy or env issues |
| infra-admin     | Haiku 4.5 | Auditing Cloudflare, Supabase, Railway, env vars|
| docs            | Haiku 4.5 | Architecture diagrams, API reference, schema docs |
| security        | Sonnet 5  | OWASP audit, auth review, access control check  |

## How to start
- Multi-step goal → @po [your goal]
- Single-agent task → call the agent directly (see quick reference below)
- Railway auto-deploys on every push to main — test at the live URL, not Artifacts

## Current goal
[REPLACE THIS LINE with what you want to work on]
```

---

## Quick reference: direct agent invocation

Skip the PO for narrow, single-agent tasks:

| Task | Command |
|------|---------|
| Any multi-step goal | `@po [goal]` |
| Plan a feature | `@feature-planning add health event logging for pets` |
| Review changes | `@code-review review server/routes.ts and server/storage.ts` |
| Write tests | `@qa write tests for the auth flow in server/auth.ts` |
| Diagnose prod issue | `@devops [symptom or error message]` |
| Audit infra | `@infra-admin audit env vars against .env.example` |
| Generate docs | `@docs generate architecture diagram and API reference` |
| Security check | `@security run full OWASP audit on the API layer` |
| Update backlog | `@backlog [discovery or goal]` |
