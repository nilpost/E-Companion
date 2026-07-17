# CLAUDE.md — E-Companion

This project keeps its working context in dedicated files instead of one long CLAUDE.md. Read these before doing anything:

| File | Purpose |
|------|---------|
| `AGENTS.md` | Stack, conventions, env vars, agent registry, postmortems/learnings |
| `STATUS.md` | Current sprint goal, in-progress items, blockers, decisions log |
| `BACKLOG.md` | All tasks, P0 (blocking) → P3 (someday) |
| `BOOTSTRAP.md` | Copy-paste session starter prompt (same content as the above, condensed) |

For any multi-step goal, prefer `@po [goal]` — it reads all three files, delegates to the right specialist agents (`.claude/agents/`), and updates `STATUS.md`/`BACKLOG.md` on exit. For a narrow single-agent task, invoke the relevant agent directly (see `AGENTS.md` → Agent registry).

Before merging a fix for a bug class that's likely to recur, check `AGENTS.md` → "Postmortems / Learnings" for prior incidents, and add an entry there (not a new file) if this one reveals a new durable pattern.
