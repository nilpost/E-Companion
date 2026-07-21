# BACKLOG — E-Companion

> Source of truth for all work items. Updated by agents and humans alike.
> Format: `- [ ] ID: Title` — check off with `[x]` when done, add ✅ date.
> Agents: use the `backlog` agent to add/refine items. Never delete completed items — they're history.

---

## P0 — Blocking / Critical
- [x] BUG-01: Production user registration/login failing (500 on /api/register, 502 on /api/login). Root cause: `passport-local` LocalStrategy verify callback and `deserializeUser` in `server/auth.ts` did not catch async errors, so a DB error thrown during login became an unhandled promise rejection and crashed the Node process (manifesting as 502 for all users, not just the one logging in). Fix merged via PR #3 (server/auth.ts, server/index.ts). ✅ 2026-07-17
- [x] BUG-02: `insertAppointmentSchema`/`insertHealthRecordSchema`/`insertActivitySchema` (any schema built from a `timestamp` column via plain `createInsertSchema`) validated date fields as `z.date()`, which rejects every ISO string a real JSON client sends (JSON has no Date type). Was latent (no client creation UI for those yet), but would have 400'd the moment one shipped. Fixed by adding `z.coerce.date()` overrides for `startTime`/`endTime` (appointments), `date` (healthRecords, activities), matching the fix already applied to reminders in FEAT-01. Verified against all four schemas with an ISO-string payload. ✅ 2026-07-19
- [ ] SEC-04: **[CONFIRMED LIVE] `users.password` (all bcrypt hashes) readable via the Supabase Data API with the public anon key.** Escalated from P1 to P0 2026-07-21 after DB-layer verification: RLS disabled on `users`, 0 policies, and the `anon` role holds schema `USAGE` + table `SELECT` + column `SELECT` on `users.password` (verified via `has_table_privilege`/`has_column_privilege`). Both the legacy `anon` key and the `sb_publishable_...` key are active and non-disabled (valid to 2036). Since PostgREST executes anon requests as the `anon` role, `GET /rest/v1/users?select=username,password` returns every hash to anyone holding that public key — plus every other `public` table (pets, health_records, chat_messages, session, …) is equally readable/writable-subject-to-grants. The only step not executed from this sandbox was the live HTTP GET (proxy blocks `*.supabase.co`); every authorization precondition PostgREST enforces is confirmed open, and the advisor independently marks these `facing: EXTERNAL`. **Fix (needs human go-ahead — production + architecturally significant): disable/restrict the Supabase Data API** (Dashboard → Settings → API → Data API → set exposed schema to none, or Project Settings → Data API off), since this app never uses PostgREST (Passport + Drizzle over `DATABASE_URL` only). This is consistent with the 2026-07-21 "no RLS / trusted DB connection" postmortem and avoids re-introducing the RLS landmine. Rotating the anon/publishable keys does **not** fix this (anon keys are meant to be public). Resolves SEC-03's root cause too. Remediation ref: https://supabase.com/docs/guides/database/database-linter?lint=0023_sensitive_columns_exposed

---

## P1 — Current Sprint

- [x] HARDEN-01: Wrap all async Express route handlers in server/routes.ts (23 routes) in try/catch or an asyncHandler wrapper — currently a DB error in any of them (e.g. GET /api/pets, POST /api/posts) becomes an unhandled promise rejection that can crash the whole Node process, same failure class as BUG-01. Escalated from P3 to P1 2026-07-17 given BUG-01 confirmed this failure class caused a production outage. Fix merged via PR #5 (server/routes.ts, asyncHandler wrapper). ✅ 2026-07-17
- [x] DOCS-03: Capture BUG-01/HARDEN-01 as a postmortem in AGENTS.md, add a PO retrospective ("learning cycle"), flag devops/infra-admin's lack of live-network access, add CLAUDE.md pointer and a visual agent organigrama. Merged via PR #6. ✅ 2026-07-17
- [x] FEAT-01: Implement feeding/care reminder CRUD (create, list, edit, delete reminders per pet). Backend only — `reminders` table + relations + schema in shared/schema.ts, storage functions in server/storage.ts, 4 asyncHandler-wrapped + ownership-checked routes in server/routes.ts (GET/POST /api/pets/:petId/reminders, PATCH/DELETE /api/reminders/:id). code-review caught and fixed a HIGH-severity ownership-bypass on PATCH (client could reassign ownerId/petId). PR pending. **`npx drizzle-kit push` still needs to run against the real database before these routes work — no DB credentials in this sandbox to do it.** ✅ 2026-07-19
- [x] ENV-01: Env-var audit of Railway/Supabase config vs. AGENTS.md/BOOTSTRAP.md docs. Fixed three documented-vs-actual gaps: `drizzle.config.ts` now prefers `DATABASE_URL_DIRECT ?? DATABASE_URL` for `drizzle-kit push` (was silently using the pooler); `server/auth.ts` fail-fast guards `SESSION_SECRET` instead of a `!` non-null assertion, matching the `DATABASE_URL` guard in `server/db.ts`; `.env.example` now documents `DATABASE_URL_DIRECT` and `PORT`. PR #14, ready for review, mergeable_state clean. ✅ 2026-07-21
- [ ] PR-14: Merge PR #14 (branch `claude/chrome-remote-control-v5s1ip`) once reviewed
- [ ] FEAT-02: Display active reminders on pet dashboard (client UI — consumes the FEAT-01 API)
- [ ] CHORE-01: Write BACKLOG.md + STATUS.md workflow into team habit (done when first agent cycle completes)
- [ ] SEC-03: **Supabase Data API exposes all 16 `public` tables with RLS off** (Advisor security scan, 2026-07-21 — this is 16 of the "17 issues"). `get_advisors(security)` returns `rls_disabled_in_public` (level ERROR, facing EXTERNAL) for every table: `users, pets, posts, comments, likes, activities, appointments, health_records, reminders, providers, badges, user_badges, chat_rooms, chat_messages, chat_participants, session`. **Confirmed exploitable** — the `anon` role has schema USAGE + `SELECT` on all 16 tables and RLS is off with 0 policies (see SEC-04 for the verification); the umbrella issue behind the P0. **Reconcile with the 2026-07-21 "don't add RLS" postmortem first**: that decision is correct for the *Drizzle/`DATABASE_URL`* path (app connects as `postgres`, which has `BYPASSRLS`, and enforces auth in Express), but it does **not** cover Supabase's auto-generated **PostgREST Data API on the anon/publishable key** — which is the `EXTERNAL`-facing surface the advisor is flagging. Two remediation paths: **(a, recommended)** disable/restrict the Data API entirely (Supabase → Settings → API → Data API), since this app never uses PostgREST — fully consistent with the postmortem's "trusted DB connection, no per-row policies" model and adds no RLS landmine; **(b)** enable RLS deny-all (RLS on, zero policies) on all 16 tables — but this is exactly the state the rogue `ensure_rls` trigger created and the postmortem removed, so only do this if (a) is impossible. Fixing via (a) resolves SEC-04 as well. **Needs human go-ahead (production).** Remediation ref: https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public
- SEC-04 (the 17th security issue, `sensitive_columns_exposed` on `users.password`) is **confirmed live and escalated to P0** — see the P0 section above.

---

## P2 — Next Sprint

- [ ] FEAT-03: Health event logging (vet visits, medications, weight tracking)
- [ ] FEAT-04: Health history view per pet
- [ ] QA-01: Auth flow test coverage (register, login, logout, session expiry)
- [x] QA-02: Reminder CRUD API test coverage. First tests in the repo — introduced vitest + supertest (`npm test`, `vitest.config.ts`), 18 tests covering auth/ownership (401/403), 404-before-403 ordering, happy path, and validation for all 4 reminder routes. ✅ 2026-07-19
- [ ] DOCS-01: Generate API reference (all /api/* routes)
- [ ] DOCS-02: Architecture diagram (frontend → backend → DB → infra)
- [ ] INFRA-06: Set `DATABASE_URL_DIRECT` in Railway service variables (Supabase → Settings → Database → direct connection, port 5432). Human/infra action — PR #14 wires `drizzle.config.ts` to prefer this var for `drizzle-kit push`, but until it's actually set on Railway, pushes keep falling back to the pooler. Blocks nothing today (pooler still works for DDL Drizzle has used so far) but should land before the next schema push.
- [ ] PERF-01: Add covering indexes for 24 unindexed foreign keys (Advisor performance scan, 2026-07-21, `unindexed_foreign_keys`, level INFO). Affected FKs span 11 tables: `activities`(pet_id, user_id), `appointments`(owner_id, pet_id, provider_id), `chat_messages`(room_id, sender_id), `chat_participants`(room_id, user_id), `chat_rooms`(created_by), `comments`(post_id, user_id), `health_records`(pet_id, veterinarian_id), `likes`(post_id, user_id), `pets`(owner_id), `posts`(pet_id, user_id), `providers`(user_id), `reminders`(pet_id, owner_id), `user_badges`(user_id, badge_id). **Add these as Drizzle `index()` definitions in `shared/schema.ts`** (not raw SQL) so they persist through `drizzle-kit push` and match the schema-as-source-of-truth model. Low urgency at current data volume, but cheap and worth doing before tables grow. Remediation ref: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

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
- [ ] PERF-02: Unused index `IDX_session_expire` on `public.session` (Advisor performance scan, 2026-07-21, `unused_index`, level INFO). **Likely no action — recommend won't-fix.** This index is created by `connect-pg-simple` and backs the session-expiry sweep; "unused" here just reflects a low-traffic / recently-created DB where the planner hasn't needed it yet, not a genuinely redundant index. Dropping it would slow session cleanup. Keep unless a real reason to remove it appears. Remediation ref: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

---

## Completed

- [x] CHORE-05: Remove Replit platform dependencies (@replit/vite-plugin-cartographer, @replit/vite-plugin-runtime-error-modal, replit-dev-banner.js script in client/index.html, .replit config) so app runs standalone off Railway. PR #8 (merged). ✅ 2026-07-17
- [x] INFRA-03: Deploy app to Railway ✅ 2026-07-13
- [x] INFRA-04: Configure Cloudflare DNS → companion.postiusgroup.com ✅ 2026-07-13
- [x] INFRA-05: Supabase PostgreSQL connected + schema pushed ✅ 2026-07-13
- [x] CHORE-04: Set up multi-agent system (.claude/agents/) ✅ 2026-07-13
- [x] CHORE-08: Add `server/seed.ts` (`npm run db:seed`) — reference/dummy data: 3 users (alice/bob owners, dr_kim vet+provider, all password `password123`), 3 pets, an appointment past + upcoming, health records, activities, and a reminder for each state (recurring, overdue, completed, upcoming), plus starter badges. Idempotent — skips if `alice` already exists. **Not yet run against a real database from this sandbox (no DB credentials) — needs `DATABASE_URL` set, and `npx drizzle-kit push` run first so the tables (including the new `reminders` table) actually exist.** ✅ 2026-07-19
