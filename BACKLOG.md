# BACKLOG — E-Companion

> Source of truth for all work items. Updated by agents and humans alike.
> Format: `- [ ] ID: Title` — check off with `[x]` when done, add ✅ date.
> Agents: use the `backlog` agent to add/refine items. Never delete completed items — they're history.

---

## P0 — Blocking / Critical
- [x] BUG-01: Production user registration/login failing (500 on /api/register, 502 on /api/login). Root cause: `passport-local` LocalStrategy verify callback and `deserializeUser` in `server/auth.ts` did not catch async errors, so a DB error thrown during login became an unhandled promise rejection and crashed the Node process (manifesting as 502 for all users, not just the one logging in). Fix merged via PR #3 (server/auth.ts, server/index.ts). ✅ 2026-07-17
- [ ] BUG-02: User reports still cannot create an account in prod (500 on /api/register, 401 on /api/user) as of 2026-07-17, after BUG-01/HARDEN-01 were already merged. Full code audit + a live end-to-end registration test (POST /api/register → 201, session persists on GET /api/user → 200, POST /api/logout → 200, GET /api/user after logout → 401, row confirmed in DB) against a freshly-migrated local Postgres DB on current HEAD (`e8e58ec`) all passed — application code is confirmed correct and the 500 could not be reproduced locally. GET /api/user returning 401 with no session cookie is expected/correct behavior, not a bug. Leading theory: Railway prod may still be serving a pre-BUG-01-fix build — STATUS.md's "Last deployed" field pointed at `77762c9`, a commit that predates the BUG-01 (`7632c1c`) and HARDEN-01 (`51ab9d9`) merges, and was never updated after those PRs merged; nothing in-repo confirms Railway's auto-deploy actually redeployed on those merges. **Needs a human to check the Railway dashboard for the actually-deployed commit SHA and force a redeploy if it's behind `main`.** Also flagged by infra-admin's static audit (unverifiable live from the agent sandbox): confirm the Supabase DB role behind `DATABASE_URL` has `CREATE TABLE` privilege — `connect-pg-simple`'s `createTableIfMissing: true` (server/storage.ts) would 500 on the first post-register session write if it doesn't.

---

## P1 — Current Sprint

- [x] HARDEN-01: Wrap all async Express route handlers in server/routes.ts (23 routes) in try/catch or an asyncHandler wrapper — currently a DB error in any of them (e.g. GET /api/pets, POST /api/posts) becomes an unhandled promise rejection that can crash the whole Node process, same failure class as BUG-01. Escalated from P3 to P1 2026-07-17 given BUG-01 confirmed this failure class caused a production outage. Fix merged via PR #5 (server/routes.ts, asyncHandler wrapper). ✅ 2026-07-17
- [x] DOCS-03: Capture BUG-01/HARDEN-01 as a postmortem in AGENTS.md, add a PO retrospective ("learning cycle"), flag devops/infra-admin's lack of live-network access, add CLAUDE.md pointer and a visual agent organigrama. Merged via PR #6. ✅ 2026-07-17
- [ ] FEAT-01: Implement feeding/care reminder CRUD (create, list, edit, delete reminders per pet)
- [ ] FEAT-02: Display active reminders on pet dashboard
- [ ] CHORE-01: Write BACKLOG.md + STATUS.md workflow into team habit (done when first agent cycle completes)

---

## P2 — Next Sprint

- [ ] FEAT-03: Health event logging (vet visits, medications, weight tracking)
- [ ] FEAT-04: Health history view per pet
- [ ] QA-01: Auth flow test coverage (register, login, logout, session expiry)
- [ ] QA-02: Reminder CRUD API test coverage
- [ ] DOCS-01: Generate API reference (all /api/* routes)
- [ ] DOCS-02: Architecture diagram (frontend → backend → DB → infra)
- [ ] CHORE-05: Add `cookie: { secure: NODE_ENV === 'production', sameSite: 'strict' }` to the express-session config in server/auth.ts — currently unset, relying on library defaults. Not confirmed as a bug, but flagged during BUG-02 investigation (2026-07-17) as worth closing given the app sits behind Cloudflare + Railway TLS termination.

---

## P3 — Someday / Backlog

- [ ] FEAT-05: Push notifications for feeding reminders
- [ ] FEAT-06: Multi-pet household support (shared access)
- [ ] FEAT-07: Photo upload for pet profiles
- [ ] FEAT-08: Mobile PWA (offline support)
- [ ] CHORE-02: Mobile-responsive polish pass
- [ ] CHORE-03: E2E test suite (Playwright)
- [ ] SEC-01: Rate limiting on auth routes
- [ ] SEC-02: Full OWASP Top 10 security audit
- [ ] INFRA-01: Staging environment on Railway
- [ ] INFRA-02: Automated DB backups (Supabase)
- [ ] CHORE-06: Chrome DevTools flags "Session History Item Has Been Marked Skippable" on /auth — history.pushState/replaceState is being invoked without user interaction on page load (likely wouter's router or the redirect-if-already-logged-in effect in client/src/pages/auth-page.tsx). Cosmetic/DX warning, not a functional bug reported by users — deferred 2026-07-17. Revisit if it starts affecting back-button UX or Lighthouse scores.

---

## Completed

- [x] INFRA-03: Deploy app to Railway ✅ 2026-07-13
- [x] INFRA-04: Configure Cloudflare DNS → companion.postiusgroup.com ✅ 2026-07-13
- [x] INFRA-05: Supabase PostgreSQL connected + schema pushed ✅ 2026-07-13
- [x] CHORE-04: Set up multi-agent system (.claude/agents/) ✅ 2026-07-13
