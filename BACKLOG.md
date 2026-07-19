# BACKLOG — E-Companion

> Source of truth for all work items. Updated by agents and humans alike.
> Format: `- [ ] ID: Title` — check off with `[x]` when done, add ✅ date.
> Agents: use the `backlog` agent to add/refine items. Never delete completed items — they're history.

---

## P0 — Blocking / Critical
- [x] BUG-01: Production user registration/login failing (500 on /api/register, 502 on /api/login). Root cause: `passport-local` LocalStrategy verify callback and `deserializeUser` in `server/auth.ts` did not catch async errors, so a DB error thrown during login became an unhandled promise rejection and crashed the Node process (manifesting as 502 for all users, not just the one logging in). Fix merged via PR #3 (server/auth.ts, server/index.ts). ✅ 2026-07-17
- [ ] BUG-02: `insertAppointmentSchema`/`insertHealthRecordSchema`/`insertActivitySchema` (any schema built from a `timestamp` column via plain `createInsertSchema`) validate date fields as `z.date()`, which rejects every ISO string a real JSON client sends (JSON has no Date type) — confirmed: `insertAppointmentSchema.safeParse({..., startTime: new Date().toISOString()})` returns `success: false`. Currently **latent, not an active incident** — the client has no create/edit UI for appointments, health records, or activities yet (only reads them), so nothing has hit this path in production. It WILL 400 the moment any of those get a creation form (e.g. building on top of FEAT-02, or FEAT-03/health logging). Found + fixed for the new reminders schema in FEAT-01 via `createInsertSchema(reminders, { dueAt: z.coerce.date() })`; apply the same pattern to the other three schemas before their first creation UI ships.

---

## P1 — Current Sprint

- [x] HARDEN-01: Wrap all async Express route handlers in server/routes.ts (23 routes) in try/catch or an asyncHandler wrapper — currently a DB error in any of them (e.g. GET /api/pets, POST /api/posts) becomes an unhandled promise rejection that can crash the whole Node process, same failure class as BUG-01. Escalated from P3 to P1 2026-07-17 given BUG-01 confirmed this failure class caused a production outage. Fix merged via PR #5 (server/routes.ts, asyncHandler wrapper). ✅ 2026-07-17
- [x] DOCS-03: Capture BUG-01/HARDEN-01 as a postmortem in AGENTS.md, add a PO retrospective ("learning cycle"), flag devops/infra-admin's lack of live-network access, add CLAUDE.md pointer and a visual agent organigrama. Merged via PR #6. ✅ 2026-07-17
- [x] FEAT-01: Implement feeding/care reminder CRUD (create, list, edit, delete reminders per pet). Backend only — `reminders` table + relations + schema in shared/schema.ts, storage functions in server/storage.ts, 4 asyncHandler-wrapped + ownership-checked routes in server/routes.ts (GET/POST /api/pets/:petId/reminders, PATCH/DELETE /api/reminders/:id). code-review caught and fixed a HIGH-severity ownership-bypass on PATCH (client could reassign ownerId/petId). PR pending. **`npx drizzle-kit push` still needs to run against the real database before these routes work — no DB credentials in this sandbox to do it.** ✅ 2026-07-19
- [ ] FEAT-02: Display active reminders on pet dashboard (client UI — consumes the FEAT-01 API)
- [ ] CHORE-01: Write BACKLOG.md + STATUS.md workflow into team habit (done when first agent cycle completes)

---

## P2 — Next Sprint

- [ ] FEAT-03: Health event logging (vet visits, medications, weight tracking)
- [ ] FEAT-04: Health history view per pet
- [ ] QA-01: Auth flow test coverage (register, login, logout, session expiry)
- [x] QA-02: Reminder CRUD API test coverage. First tests in the repo — introduced vitest + supertest (`npm test`, `vitest.config.ts`), 18 tests covering auth/ownership (401/403), 404-before-403 ordering, happy path, and validation for all 4 reminder routes. ✅ 2026-07-19
- [ ] DOCS-01: Generate API reference (all /api/* routes)
- [ ] DOCS-02: Architecture diagram (frontend → backend → DB → infra)

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
- [ ] CHORE-06: Update GitHub repo "homepage" metadata field (still points to old replit.com project URL) to https://companion.postiusgroup.com — requires repo admin, blocked from this sandbox (proxy blocks repo-settings writes)
- [ ] CHORE-07: Fix pre-existing `npm run check` type errors in server/storage.ts (insert() array-typed fields like gpsRoute/attachments/services mismatched against Drizzle's overload types) — found while verifying build during CHORE-05, unrelated to Replit removal, not yet triaged

---

## Completed

- [x] CHORE-05: Remove Replit platform dependencies (@replit/vite-plugin-cartographer, @replit/vite-plugin-runtime-error-modal, replit-dev-banner.js script in client/index.html, .replit config) so app runs standalone off Railway. PR #8 (merged). ✅ 2026-07-17
- [x] INFRA-03: Deploy app to Railway ✅ 2026-07-13
- [x] INFRA-04: Configure Cloudflare DNS → companion.postiusgroup.com ✅ 2026-07-13
- [x] INFRA-05: Supabase PostgreSQL connected + schema pushed ✅ 2026-07-13
- [x] CHORE-04: Set up multi-agent system (.claude/agents/) ✅ 2026-07-13
