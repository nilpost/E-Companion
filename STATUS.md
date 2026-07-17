# STATUS — E-Companion

> Updated by the PO agent at the end of every session.
> Humans: read this to know where things stand. Agents: read this before starting work.

---

## Current sprint goal
Get feeding/care reminders fully functional end-to-end (FEAT-01, FEAT-02).

## Last deployed
- **Commit**: `77762c9` — fix vite.config.ts import.meta.dirname (production crash) — **this field has not been kept in sync with merges; see BUG-02 blocker above. A human must confirm the actual Railway-deployed commit and update this line.**
- **URL**: https://companion.postiusgroup.com
- **Status**: Unverified — see BUG-02 blocker. No deploy was triggered by this session (no push to `main`; work is on `claude/account-creation-form-a11y-yl1um8`).

## In progress
| Item | Owner | Started | Notes |
|------|-------|---------|-------|
| BUG-02 | po + infra-admin | 2026-07-17 | User reports /api/register still 500ing in prod after BUG-01/HARDEN-01 merged. Code audited + live end-to-end registration test passed against current HEAD (e8e58ec) on a fresh local Postgres DB — app code confirmed correct, could not reproduce. a11y/autofill fixes for the /auth form shipped in the same pass. **Blocked on human verifying the Railway-deployed commit SHA** — leading theory is prod is still on a pre-fix build (see Blockers). |
| FEAT-01 | — | — | Not started yet |

## Blockers
- **BUG-02 (2026-07-17)**: Cannot confirm from this sandbox whether Railway prod is actually running the BUG-01/HARDEN-01 fix (`7632c1c`/`51ab9d9`, both included in current `main` HEAD `e8e58ec`) — sandbox has no live network access to the Railway dashboard. STATUS.md's own "Last deployed" line was pointing at `77762c9`, a commit that predates those fixes, which was never updated after the PR #3/#5 merges. **Action needed from a human**: open the Railway dashboard, confirm the deployed commit is `e8e58ec` or later, and force a redeploy if not. Also worth a human checking (from infra-admin's static audit, unverifiable live from here): whether the Supabase DB role used by `DATABASE_URL` has `CREATE TABLE` privilege, since `connect-pg-simple`'s `createTableIfMissing: true` (server/storage.ts) would 500 on the first post-register session write if not.

## Decisions log
| Date | Decision | Why |
|------|----------|-----|
| 2026-07-13 | Use Railway + Supabase + Cloudflare | Simplest stack for solo/small team |
| 2026-07-13 | Git files (BACKLOG.md, STATUS.md) as shared brain | Works across all chat sessions and agents |
| 2026-07-13 | Work directly on deployed app, not Artifacts | Avoids duplicate work, tests with real data |
| 2026-07-17 | Identified passport-local unhandled-rejection bug as root cause of register/login production incident; fix staged but not committed | Change affects production auth for all users — wants explicit confirmation before deploy |
| 2026-07-17 | BUG-01 fixed and merged (PR #3) after independent qa + devops agent sign-off | Confirmed safe: full try/catch coverage, build passes, Railway `ON_FAILURE` restart policy confirmed the crash theory |
| 2026-07-17 | Escalated HARDEN-01 to P1 and wrapped all 23 async routes in `server/routes.ts` with an `asyncHandler` forwarding to the global error middleware | BUG-01 proved this failure class (unhandled rejection → process crash) causes real production outages; same risk existed across every route, not just auth |
| 2026-07-17 | Re-audited register/login flow after a second "still cannot create account" report; ran a full live end-to-end test (register → session persist → logout) against a fresh local Postgres DB on current HEAD (e8e58ec) instead of trusting typecheck/build alone | User explicitly required actual account-creation testing before approval, not just static checks; this is also the pattern the BUG-01 postmortem calls for — verify against real behavior, not assumptions |
| 2026-07-17 | Did not conclude BUG-02 is a new code bug — left it open (P0) pending human confirmation of the live Railway deployed commit | Code is provably correct locally; the only unverifiable variable from this sandbox is whether prod actually redeployed after BUG-01/HARDEN-01 merged, and STATUS.md's stale "Last deployed" field suggests it may not have |
| 2026-07-17 | Fixed /auth form a11y issues (missing autocomplete on all inputs, missing id/label pairing on the role Select) and a separate real bug found in the same file tree — `apiRequest` was used but never imported in client/src/hooks/use-auth.tsx, which would break logout at runtime | Low-risk, directly requested by the user (a11y) or directly adjacent and load-bearing for the auth flow being tested (logout) |

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
