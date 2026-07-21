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
| FEAT-02 | — | 2026-07-19 | Backend (FEAT-01) is done and merge-ready; dashboard UI not started |

## Blockers
| Item | Why | Unblocks when |
|------|-----|----------------|
| `DATABASE_URL_DIRECT` not set in Railway service variables | PR #14 wires `drizzle.config.ts` to prefer `DATABASE_URL_DIRECT` for `drizzle-kit push`, but the variable itself isn't set on Railway yet, so pushes still silently fall back through the Supabase pooler until it is | Human sets `DATABASE_URL_DIRECT` in Railway (Supabase → Settings → Database → direct connection, port 5432); tracked as INFRA-06 |

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
| 2026-07-19 | FEAT-01 (reminder CRUD) implemented backend-only, per feature-planning's spec | Matches the existing FEAT-01/FEAT-02 split — dashboard UI is separate scope |
| 2026-07-19 | Introduced the project's first test framework (vitest + supertest, `npm test`) instead of hand-verifying the new routes | code-review's ownership-bypass finding (below) made it clear this surface needed real regression coverage, not a one-off manual check |
| 2026-07-19 | Fixed a HIGH-severity ownership-bypass on PATCH /api/reminders/:id before merging | code-review caught that `insertReminderSchema.partial()` still allowed `ownerId`/`petId` in the body, letting a reminder's owner reassign it to a different pet/owner despite the ownership check above it; added a dedicated `updateReminderSchema` that omits both |
| 2026-07-19 | Logged BUG-02 (P1) rather than fixing it now | `createInsertSchema` on a `timestamp` column produces `z.date()`, which rejects the ISO strings any real JSON client sends — confirmed on `insertAppointmentSchema` too, but latent since no client UI creates appointments/health records/activities yet. Fixed only for the new reminders schema; flagged so it's fixed before FEAT-02 or FEAT-03 builds a creation form on one of the other three |
| 2026-07-19 | Fixed BUG-02 for real (`insertAppointmentSchema`, `insertHealthRecordSchema`, `insertActivitySchema`) | User asked for it explicitly; same one-line `z.coerce.date()` fix as reminders, verified against all four schemas with an ISO-string payload |
| 2026-07-19 | Added `server/seed.ts` + `npm run db:seed` for reference/dummy data | User wants a reference dataset in the DB; this sandbox has no `DATABASE_URL`/`DATABASE_URL_DIRECT`, so the script is written and typechecked but **not yet run against a real database** — needs `drizzle-kit push` first, then `npm run db:seed`, from an environment with DB credentials |
| 2026-07-21 | Root-caused "cannot create a user from web portal" (BUG-03) to Railway's `DATABASE_URL` pointing at Supabase's **IPv6-only direct host** (`db.<ref>.supabase.co:5432`), which Railway can't route → every DB query fails to connect (app boots "Online", but 0 rows, no `session` table, no ERROR logs, no app connections in `pg_stat_activity`). Fix: repoint `DATABASE_URL` to the IPv4 Supavisor **pooler** (`postgres.<ref>@aws-0-ap-northeast-1.pooler.supabase.com:6543`), as `.env.example` already prescribes. Diagnosed via Supabase MCP + DNS (direct host has no A record; pooler host resolves IPv4). See postmortem in AGENTS.md | The app uses Supabase purely as Postgres (Passport/Drizzle, not Supabase Auth), so the only wire is `DATABASE_URL`; a direct-vs-pooler mismatch silently breaks all persistence |
| 2026-07-21 | Removed a rogue `ensure_rls` event trigger + `public.rls_auto_enable()` SECURITY DEFINER function that was auto-enabling RLS on every new `public` table, leaving all app tables with RLS ON and zero policies (`rls_enabled_no_policy` on all 14). Dropped both and disabled RLS across the public schema (migration `remove_rogue_rls_auto_enable_and_disable_rls`) | Not part of the Drizzle app — a manually-added change that fights the app's model (trusted DB connection, auth enforced in Express). Currently masked only because the `postgres` role has `BYPASSRLS`; a latent landmine if the app ever connects as a non-superuser role, and it would have re-enabled RLS on the `session` table on first boot |
| 2026-07-21 | Created the missing `public.reminders` table via Supabase MCP (migration `create_reminders_table`), matching `shared/schema.ts` exactly | FEAT-01 added `reminders` to the schema but it was never pushed to this DB; created ahead of the redeploy so reminder routes don't 500. A later `npm run db:push` is a no-op for it |
| 2026-07-21 | Triaged the Supabase Advisor "17 issues" into the backlog (no fixes applied — record-only, per the ask). The 17 are all **security**: 16× `rls_disabled_in_public` (SEC-03, one per public table) + 1× `sensitive_columns_exposed` on `users.password` (SEC-04). Also logged the separate **performance** scan: 24 unindexed FKs (PERF-01) + 1 unused index (PERF-02, recommended won't-fix). Key call-out: the RLS warnings are **not** re-litigating the 2026-07-21 "no RLS" postmortem — that covers the Drizzle/`DATABASE_URL` path (postgres role, `BYPASSRLS`), whereas the advisor flags the Supabase **Data API / PostgREST + anon key** surface, which that decision never addressed. SEC-04 (`users.password` externally reachable) is the one with real teeth. Recommended remediation for both SEC items: **disable the Data API** (app never uses PostgREST) rather than enable RLS deny-all — the former aligns with the postmortem and avoids re-creating the RLS landmine that was removed | Advisor surfaced 17 findings; per the "check and add to backlog" ask these are recorded and framed against prior decisions, not fixed |
| 2026-07-21 | **Verified SEC-04 is a live credential exposure → escalated to P0.** DB-layer checks (`has_table_privilege`/`has_column_privilege`/`pg_class.relrowsecurity`/`pg_policies`) confirm the `anon` role holds schema USAGE + table SELECT + column SELECT on `users.password`, RLS is off, 0 policies, on all 16 public tables; both the legacy anon key and the `sb_publishable_...` key are active (valid to 2036). PostgREST runs anon requests as `anon`, so `GET /rest/v1/users?select=username,password` returns every bcrypt hash to anyone with the (public-by-design) anon key. Could not run the live HTTP GET from this sandbox (proxy blocks `*.supabase.co`), but every authorization precondition PostgREST enforces is open and the advisor marks these `facing: EXTERNAL`. **Human approved the DB-level lockdown**; applied migration `revoke_data_api_anon_access` (`REVOKE ALL … FROM anon, authenticated` on all public tables/sequences/functions + matching `ALTER DEFAULT PRIVILEGES FOR ROLE postgres` so future `db:push` tables don't re-open it). Verified: 0/16 tables readable by anon/authenticated, `users.password` anon SELECT now false, app's `postgres` role unaffected. SEC-04 closed. Chose REVOKE over RLS to stay aligned with the "no RLS" postmortem; key rotation was explicitly *not* the fix (anon keys are public by design). SEC-03 stays open as defense-in-depth — RLS is still off so the advisor will keep listing `rls_disabled_in_public` cosmetically; the durable fix is disabling the Data API gateway (manual, no MCP tool) | A confirmed live exposure of all password hashes is P0; DB-level REVOKE is a clean, reversible, app-safe stop-gap (app connects as postgres, not anon) that closes it immediately without the RLS landmine |
| 2026-07-21 | **Forensic follow-up on SEC-04: no evidence of exploitation.** Checked three sources: (1) API gateway logs — only Supabase infra health-checks, zero `/rest/v1/users`; (2) `pg_stat_statements` — the `anon`/`authenticated` roles executed **zero** statements (only the `authenticator` role's PostgREST schema-cache introspection), so the Data API never served a table query; (3) Postgres logs — only migrations/DDL + a dashboard-owner `count(*) on auth.users` (benign). Blast radius: `public.users` held exactly **1 row**, created 2026-07-21 14:21 (same day the hole was open). Conclusion: exposure window was real but unexploited on available telemetry; forced password reset not warranted (optional rotation of the single test account if desired). Caveats: pg_stat_statements is blind if reset (no sign of it); gateway log retention is 24h but fully covers the window | Wanted to know whether the open window was actually abused before closing SEC-04 out; telemetry says no reads occurred and only one recent account existed |
| 2026-07-21 | Ran an env-var audit (Railway/Supabase config vs. AGENTS.md/BOOTSTRAP.md docs) and merged PR #14 | Found three documented-vs-actual gaps: (1) `drizzle.config.ts` read only `DATABASE_URL`, so `drizzle-kit push` silently ran through the Supabase pooler despite docs claiming a direct connection — now prefers `DATABASE_URL_DIRECT ?? DATABASE_URL`, using the Supavisor **session-mode** pooler (port 5432, IPv4-safe for Railway) rather than the IPv6-only direct host that BUG-03 above showed Railway can't route; (2) `server/auth.ts` used a `!` non-null assertion on `SESSION_SECRET` instead of a fail-fast guard, unlike the equivalent `DATABASE_URL` guard in `server/db.ts` — now guarded with a clear startup error; (3) `.env.example` didn't document `DATABASE_URL_DIRECT` or `PORT` — now documents both. Runtime app connection (`server/db.ts`) unchanged; `npm run check` clean for changed files (pre-existing unrelated errors remain in `server/storage.ts` and `client/src/hooks/use-auth.tsx`, tracked as CHORE-07) |

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
