# Deploying E-Companion on a Synology NAS

Written 2026-08-13, when the Railway trial expired (INFRA-07) and self-hosting on
the NAS became the chosen path. Companion to `Dockerfile` / `docker-compose.yml`.

---

## The one architectural thing to get right

**Tailscale does not publish the site. Cloudflare Tunnel does.**

Tailscale puts the NAS on a private mesh — excellent for reaching DSM, SSH, and
the container logs from anywhere without opening a port, and that is what you
should use to *operate* the box. But a tailnet is private by definition. If
`companion.postiusgroup.com` is served over Tailscale alone, only your own
devices can load it, which is not what a public app with user registration needs.

Tailscale *Funnel* can expose a service publicly, but only on a `*.ts.net`
hostname — the TLS certificate will not match a custom domain, so it does not
preserve the current URL.

So the split is:

| Job | Tool |
|-----|------|
| Serve `companion.postiusgroup.com` publicly | **Cloudflare Tunnel** (`cloudflared`) |
| Reach DSM / SSH / logs to operate the NAS | **Tailscale** |

Cloudflare Tunnel also fits what is already in place: the domain is on
Cloudflare (INFRA-04). The connection is outbound-only, so there is no port
forwarding, no DDNS, and the home IP is never exposed. It carries WebSockets,
which `chat-view.tsx` needs.

## Prerequisites

- **An x86 Synology.** Container Manager needs it. ARM value models (DS120j,
  DS223j, and similar) cannot run Docker at all — check before going further.
- **DSM 7.2+** with **Container Manager** installed (older DSM calls it Docker).
- A Cloudflare account with `postiusgroup.com` already on it — you have this.

## First deploy

1. **Get the code onto the NAS.** A shallow clone into a shared folder is
   simplest: `git clone --depth 1 https://github.com/nilpost/E-Companion.git`.

2. **Create `.env` next to `docker-compose.yml`.** It is gitignored; never
   commit it. See `.env.example` for the full list. Minimum:

   ```
   DATABASE_URL=postgresql://postgres.<ref>:<pw>@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   DATABASE_URL_DIRECT=postgresql://postgres.<ref>:<pw>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
   SESSION_SECRET=<long random string>
   TUNNEL_TOKEN=<from the Cloudflare tunnel you create in step 3>
   ```

   Use the **pooler** host, not `db.<ref>.supabase.co`. That direct host is
   IPv6-only and was the root cause of BUG-03 — see the postmortem in
   `AGENTS.md`. A home network is at least as likely as Railway to lack working
   IPv6 egress.

3. **Create the Cloudflare tunnel.** Zero Trust → Networks → Tunnels → Create.
   Add a public hostname: `companion.postiusgroup.com` → `http://app:5000`
   (`app` is the compose service name, resolvable on the compose network). Copy
   the tunnel token into `.env`. Cloudflare manages the DNS record for you —
   remove the old Railway record so they do not conflict.

4. **Build and start:**

   ```bash
   docker compose --profile public up -d --build
   ```

   First build takes a while on NAS-class hardware — `vite build` is the slow
   part. See "Build somewhere else" below if this is painful.

5. **Verify, in this order** — the point of the deep probe is that it separates
   the two failure modes that looked identical during the 2026-08-13 outage:

   ```bash
   curl localhost:5000/api/health          # process is alive
   curl localhost:5000/api/health?deep=1   # ...and the database answers
   curl https://companion.postiusgroup.com/api/health   # ...and the tunnel routes
   ```

   A 503 with `"db":"unreachable"` means the app is fine and Supabase is not —
   most likely paused again (INFRA-08) or a wrong `DATABASE_URL`.

## Updating

There is no push-to-deploy here; that convenience was Railway's. Pick one:

- **Manual** (start here): `git pull && docker compose --profile public up -d --build`
- **Watchtower**: run it alongside, have GitHub Actions build and push to GHCR,
  and Watchtower pulls the new image automatically. Closest to what Railway did.
- **Self-hosted Actions runner** on the NAS: most control, most setup.

### Build somewhere else

If building on the NAS is too slow, build in GitHub Actions, push to
`ghcr.io/nilpost/e-companion`, and have the NAS only pull. The image name in
`docker-compose.yml` is already set for this — drop the `build:` line and the
NAS stops compiling anything.

## What you are trading away

Worth being clear-eyed, given this project has already had one outage caused by
infrastructure going quiet:

- **No SLA.** Home power, ISP, and DSM update reboots are now your uptime story.
- **No managed deploys.** Every update is a command you run.
- **Upload bandwidth** is the ceiling on serving assets, though Cloudflare caches
  the static build.
- **You still depend on Supabase**, which still auto-pauses after 7 days idle on
  the free tier. A NAS container running 24/7 holds a pool connection, so this
  should stop recurring — but that is a side effect, not a guarantee.

The upside is real too: $0 marginal cost, no trial clock to expire, and hardware
you already own.

## Later: drop Supabase entirely?

Once this is stable, Postgres could move onto the NAS as a third compose service,
which would end the auto-pause problem permanently and close SEC-03 (the Supabase
Data API surface) by deleting the surface. It also makes backups your job. Not for
the first deploy — change one thing at a time.
