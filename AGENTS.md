# AGENTS.md — E-Companion

> Read by the PO agent at startup. Keep this file short and accurate.
> Agents should not read the full codebase — use this as the map.

## Project overview
Pet care companion app. Users track pets, schedule feeding/care reminders, and log health events.

## Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite + Tailwind + shadcn/ui |
| Backend | Express.js + Node.js (ESM) |
| Real-time | WebSockets |
| Auth | Passport.js (session-based) |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Supabase) |
| Hosting | Railway (auto-deploy from `main`) |
| DNS | Cloudflare → `companion.postiusgroup.com` |

## Key file paths
```
client/src/           # React frontend
  pages/              # Route-level components
  components/         # Shared UI components
  hooks/              # Custom React hooks
server/
  routes.ts           # All API routes
  auth.ts             # Passport.js auth config
  storage.ts          # DB queries (Drizzle)
  db.ts               # DB connection
shared/
  schema.ts           # Drizzle schema (source of truth for DB shape)
  types.ts            # Shared TypeScript types
dist/                 # Build output (do not edit)
```

## Database
- **Supabase project**: `ynegbxsokzonsjrandyi` (AWS ap-northeast-1)
- **Schema location**: `shared/schema.ts`
- **Migrations**: `npx drizzle-kit push` (no migration files — push-based)
- **Connection**: `DATABASE_URL` env var (use `DATABASE_URL_DIRECT` for migrations)

## Build & deploy
- **Build command**: `npm run build` (runs Vite for client + esbuild for server)
- **Start command**: `npm run start`
- **Node version**: 18 (Railway default — use `fileURLToPath` not `import.meta.dirname`)
- **nixpacks.toml**: sets `npm install --include=dev` so devDeps are available during build

## Auth conventions
- Session-based auth via Passport.js (not JWT)
- `req.user` is set when authenticated
- Auth routes: `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/user`
- All `/api/*` routes except auth require `isAuthenticated` middleware

## Code conventions
- TypeScript strict mode
- Drizzle queries in `server/storage.ts` — keep business logic out of routes
- API responses: `{ data }` on success, `{ message }` on error
- No comments unless the WHY is non-obvious
- No `import.meta.dirname` — use `fileURLToPath(import.meta.url)` or `process.cwd()`

## Session files (read these every session)
| File | Purpose |
|------|---------|
| `AGENTS.md` | Stack, conventions, agent index (this file) |
| `STATUS.md` | Current sprint, in-progress work, blockers, decisions |
| `BACKLOG.md` | All tasks by priority — P0 blocking → P3 someday |

## Agents
| Agent | Model | When to use |
|-------|-------|-------------|
| `po` | Sonnet 5 | Entry point for any goal. Reads all 3 session files. Orchestrates others. Updates BACKLOG+STATUS on exit. |
| `backlog` | Haiku 4.5 | Add/refine items in BACKLOG.md |
| `code-review` | Sonnet 5 | Review diffs before merge |
| `qa` | Haiku 4.5 | Write tests for a scope |
| `devops` | Haiku 4.5 | Diagnose deploy/env/build issues |
| `feature-planning` | Sonnet 5 | Technical spec before coding starts |
| `infra-admin` | Haiku 4.5 | Audit Cloudflare, Supabase, Railway, env vars |
| `docs` | Haiku 4.5 | Architecture diagrams, API docs, schema docs, README |
| `security` | Sonnet 5 | OWASP audit, auth review, access control |

## Current backlog status
> Update this section when the backlog changes significantly.
- Core pet CRUD: done
- Feeding/care reminders: in progress
- Health event logging: not started
- Push notifications: not started
- Mobile-responsive polish: not started
