# STATUS — E-Companion

> Updated by the PO agent at the end of every session.
> Humans: read this to know where things stand. Agents: read this before starting work.

---

## Current sprint goal
Get feeding/care reminders fully functional end-to-end (FEAT-01, FEAT-02).

## Last deployed
- **Commit**: `77762c9` — fix vite.config.ts import.meta.dirname (production crash)
- **URL**: https://companion.postiusgroup.com
- **Status**: Live and stable

## In progress
| Item | Owner | Started | Notes |
|------|-------|---------|-------|
| FEAT-01 | — | — | Not started yet |

## Blockers
- BUG-01: Production user registration/login broken (500 on /api/register, 502 on /api/login, 401 on /api/user). Root cause identified: `passport-local`'s LocalStrategy verify callback and `passport.deserializeUser` in `server/auth.ts` did not catch async/DB errors — an error thrown during a DB call becomes an unhandled promise rejection that crashes the whole Node process (Railway then serves 502s to everyone until restart), which also explains why /api/register surfaced raw 500s (same DB issue, but that handler already had try/catch so it degraded instead of crashing). Fix written on branch `claude/user-creation-api-errors-k4gra4` (uncommitted, pending user confirmation — production-affecting). Also still unconfirmed: whether a transient Supabase outage/connection issue was the trigger (infra-admin agent could not check live Supabase/Railway dashboards — no credentials available to this session).

## Decisions log
| Date | Decision | Why |
|------|----------|-----|
| 2026-07-13 | Use Railway + Supabase + Cloudflare | Simplest stack for solo/small team |
| 2026-07-13 | Git files (BACKLOG.md, STATUS.md) as shared brain | Works across all chat sessions and agents |
| 2026-07-13 | Work directly on deployed app, not Artifacts | Avoids duplicate work, tests with real data |
| 2026-07-17 | Identified passport-local unhandled-rejection bug as root cause of register/login production incident; fix staged but not committed | Change affects production auth for all users — wants explicit confirmation before deploy |

## Agent team status
| Agent | Status |
|-------|--------|
| po | ✅ active |
| backlog | ✅ active |
| code-review | ✅ active |
| qa | ✅ active |
| devops | ✅ active |
| feature-planning | ✅ active |
| infra-admin | ✅ active |
| docs | ✅ active |
| security | ✅ active |
