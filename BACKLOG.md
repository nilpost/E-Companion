# BACKLOG — E-Companion

> Source of truth for all work items. Updated by agents and humans alike.
> Format: `- [ ] ID: Title` — check off with `[x]` when done, add ✅ date.
> Agents: use the `backlog` agent to add/refine items. Never delete completed items — they're history.

---

## P0 — Blocking / Critical
- [ ] BUG-01: Production user registration/login failing (500 on /api/register, 502 on /api/login). Root cause: `passport-local` LocalStrategy verify callback and `deserializeUser` in `server/auth.ts` did not catch async errors, so a DB error thrown during login became an unhandled promise rejection and crashed the Node process (manifesting as 502 for all users, not just the one logging in). Fix implemented on branch `claude/user-creation-api-errors-k4gra4` (server/auth.ts, server/index.ts) but NOT yet committed/deployed — pending user confirmation given production impact. Also flagged: underlying trigger may be a transient Supabase DB connectivity issue (infra-admin audit requested, pending).

---

## P1 — Current Sprint

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

---

## P3 — Someday / Backlog

- [ ] HARDEN-01: Wrap all async Express route handlers in server/routes.ts (23 routes) in try/catch or an asyncHandler wrapper — currently a DB error in any of them (e.g. GET /api/pets, POST /api/posts) becomes an unhandled promise rejection that can crash the whole Node process, same failure class as BUG-01.
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

---

## Completed

- [x] INFRA-03: Deploy app to Railway ✅ 2026-07-13
- [x] INFRA-04: Configure Cloudflare DNS → companion.postiusgroup.com ✅ 2026-07-13
- [x] INFRA-05: Supabase PostgreSQL connected + schema pushed ✅ 2026-07-13
- [x] CHORE-04: Set up multi-agent system (.claude/agents/) ✅ 2026-07-13
