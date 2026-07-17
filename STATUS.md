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
_None currently open._

## Decisions log
| Date | Decision | Why |
|------|----------|-----|
| 2026-07-13 | Use Railway + Supabase + Cloudflare | Simplest stack for solo/small team |
| 2026-07-13 | Git files (BACKLOG.md, STATUS.md) as shared brain | Works across all chat sessions and agents |
| 2026-07-13 | Work directly on deployed app, not Artifacts | Avoids duplicate work, tests with real data |
| 2026-07-17 | Identified passport-local unhandled-rejection bug as root cause of register/login production incident; fix staged but not committed | Change affects production auth for all users — wants explicit confirmation before deploy |
| 2026-07-17 | BUG-01 fixed and merged (PR #3) after independent qa + devops agent sign-off | Confirmed safe: full try/catch coverage, build passes, Railway `ON_FAILURE` restart policy confirmed the crash theory |
| 2026-07-17 | Escalated HARDEN-01 to P1 and wrapped all 23 async routes in `server/routes.ts` with an `asyncHandler` forwarding to the global error middleware | BUG-01 proved this failure class (unhandled rejection → process crash) causes real production outages; same risk existed across every route, not just auth |
| 2026-07-17 | Removed all Replit platform dependencies (CHORE-05): `@replit/vite-plugin-*` devDeps, the unconditional `replit-dev-banner.js` script tag in `client/index.html`, and the `.replit` config file. PR #8 opened as draft, not yet merged | App now deploys on Railway, not Replit; the dev-banner script was fetching from Replit's CDN on every page load in production, and the vite plugins were dead-weight devDeps that also broke `npm run check` once uninstalled from a non-Replit environment |

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
