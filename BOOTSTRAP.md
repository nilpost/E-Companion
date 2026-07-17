# BOOTSTRAP — New session quick-start prompt

> Paste the block below into a new Claude Code context window to resume work instantly.
> Delete or update the "Current goal" line before pasting.

---

```
I'm working on E-Companion, a pet care app deployed at https://companion.postiusgroup.com.

## Stack
React 18 + TypeScript + Vite frontend, Express.js + Node.js (ESM) backend, WebSockets,
Passport.js session auth, Drizzle ORM, Supabase PostgreSQL, hosted on Railway,
DNS via Cloudflare on postiusgroup.com.

## Session files — read these first
- AGENTS.md    → stack, conventions, full agent registry
- STATUS.md    → current sprint goal, in-progress work, blockers, decisions log
- BACKLOG.md   → all tasks by priority (P0 blocking → P3 someday)

## Agent system
We have 9 specialist agents in .claude/agents/:

| Agent           | Model     | Role                                              |
|-----------------|-----------|---------------------------------------------------|
| po              | Sonnet 5  | Orchestrator. Reads all 3 session files. Delegates to others. Updates files on exit. |
| backlog         | Haiku 4.5 | Creates/updates BACKLOG.md items                  |
| code-review     | Sonnet 5  | Reviews diffs before merge                        |
| qa              | Haiku 4.5 | Writes tests for a given scope                    |
| devops          | Haiku 4.5 | Diagnoses build/deploy/env issues                 |
| feature-planning| Sonnet 5  | Technical spec before coding starts               |
| infra-admin     | Haiku 4.5 | Audits Cloudflare, Supabase, Railway, env vars    |
| docs            | Haiku 4.5 | Architecture diagrams, API docs, schema, README   |
| security        | Sonnet 5  | OWASP audit, auth review, access control          |

## How to use
- Start any task with: @po [your goal]
- PO reads AGENTS.md + STATUS.md + BACKLOG.md + git log at startup
- PO delegates to specialists, then updates BACKLOG.md and STATUS.md and commits
- Work directly on the deployed app (Railway auto-deploys on push to main)
- Never use Artifacts for this app — test with real data at the deployed URL

## Key file paths
- shared/schema.ts      → Drizzle schema (DB source of truth)
- server/routes.ts      → all API routes
- server/auth.ts        → Passport.js auth config
- server/storage.ts     → DB queries
- client/src/pages/     → route-level React components
- client/src/components/→ shared UI components

## Conventions
- Session-based auth (not JWT) — req.user set by Passport
- Drizzle queries only in server/storage.ts
- No import.meta.dirname — use fileURLToPath(import.meta.url) or process.cwd()
- API success: { data } / API error: { message }
- Migrations: npx drizzle-kit push (no migration files)

## Current goal
[REPLACE THIS LINE with what you want to work on]
```

---

## Quick reference: invoking agents directly

Skip the PO for narrow tasks:

| Task | Command |
|------|---------|
| Plan a feature | `@feature-planning [feature goal]` |
| Review recent changes | `@code-review review git diff HEAD~1` |
| Write tests for a file | `@qa server/routes.ts` |
| Diagnose prod issue | `@devops [symptom or error]` |
| Audit infra | `@infra-admin full audit` |
| Add backlog items | `@backlog [discovery or goal]` |
| Generate docs | `@docs architecture diagram` |
| Security check | `@security full audit` |
