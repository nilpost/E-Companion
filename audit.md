# Security policy

## Supported versions

Only the latest commit on the default branch is supported. Historical commits, forks, and unmaintained deployments are unsupported.

## Private vulnerability reporting

Use GitHub private vulnerability reporting from the repository's **Security** tab. If it is unavailable, contact the repository owner privately using the contact method on the owner's GitHub profile. Include affected paths, reproduction conditions, impact, and a minimal proof of concept. Never send real passwords, medical records, or other personal data.

Do **not** disclose vulnerabilities through public GitHub issues, discussions, pull requests, or other public channels before coordinated disclosure.

## Security expectations

- Run only behind HTTPS with a strong `SESSION_SECRET` and a least-privilege database role.
- Treat account, pet, location, appointment, health, and chat data as sensitive personal data.
- Return explicit public response DTOs rather than database rows, and never serialize password hashes.
- Require authentication and authorization on both HTTP and WebSocket channels.
- Minimize response logging and keep production logs access-controlled with a defined retention period.

# Security & Privacy Remediation Backlog

- [ ] **E-COMPANION-001 — HIGH — Sensitive data exposure / missing WebSocket authentication**
  - **Affected files/lines:** `shared/schema.ts:6-22`; `server/storage.ts:137-167`, `170-203`, `222-236`, `411-426`, `450-467`; `server/routes.ts:55-83`, `247-268`, `270-289`, `350-384`
  - **Description:** Database queries attach complete `users` rows—including password hashes, email, phone, and location—to post, comment, chat, and provider responses. The WebSocket handshake has no session authentication or room authorization, and broadcasts a complete `req.user` object to anyone who sends a guessed `join_room` message.
  - **Exposure path:** An attacker can self-register and fetch community API responses containing other users' complete records. Without any account, an attacker can connect to `/ws`, join predictable room IDs, and receive future chat broadcasts containing the message and sender's complete user row.
  - **Impact:** Disclosure of password hashes and personal data enables offline password cracking, credential reuse attacks, stalking/privacy harm, and unauthorised chat monitoring.
  - **Confidence:** HIGH — full-row selections, direct response serialization, unauthenticated room joining, and full-user broadcast are explicit in source.
  - **Remediation:** Define allowlisted public user DTOs that exclude `password`, email, phone, location, and internal flags; select only required columns. Authenticate WebSocket upgrades from the session, authorize room membership, validate room IDs, and broadcast only a minimal sender DTO. Add tests asserting sensitive fields never appear over HTTP or WebSocket.
  - **Status:** OPEN

- [ ] **E-COMPANION-002 — MEDIUM — Sensitive response logging**
  - **Affected files/lines:** `server/index.ts:9-33`; `server/auth.ts:94-102`, `121-134`
  - **Description:** Middleware captures every JSON API response and appends its serialized body to application logs. Registration, login, and user endpoints return raw user objects containing a password hash and personal fields, so their leading response content can be copied into logs even though the log line is truncated.
  - **Exposure path:** A normal registration/login or API request produces a JSON response; the response wrapper serializes it into the production log stream, which may be retained or forwarded to hosting/telemetry providers.
  - **Impact:** Password hashes and personal data can persist outside the primary database with broader operator/vendor access and uncontrolled retention, increasing breach impact.
  - **Confidence:** HIGH — the response capture and `JSON.stringify(capturedJsonResponse)` sink apply to all `/api` responses, and authentication routes directly return database user objects.
  - **Remediation:** Stop logging response bodies by default. Use structured metadata-only logging with explicit field allowlists and redaction; ensure password hashes and personal data are removed from response DTOs; define log access and retention controls and rotate/delete affected historical logs if present.
  - **Status:** OPEN
