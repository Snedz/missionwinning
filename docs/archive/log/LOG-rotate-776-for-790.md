# Rotated from LOG.md when `.790` landed

## 2026-08-14 — Mission Server durable rooms (`.776`)

Pending founder migrations are apply-debt, not a constitution ban.
Community is in `vision.md`. The `.752` "no postgres" line was one-PR
hygiene. This ship is the durable half.

**Ship:** `social_messages` + presence + reports (RLS, signed-in). Outbox
kinds `social.message` / `social.presence` / `social.report`. Guests stay
local. Missing table fail-opens. No Vercel sockets — `postgres_changes` +
shared `mw-garage` broadcast. Report on remote lines. `/api/social` parks
with the `server` surface.

Label `.776` (onto master `.775`).
Excellence-Override below.

Excellence-Override: Mission Server durable rooms

Rotated LOG oldest → [docs/archive/log/LOG-rotate-761-for-776.md](docs/archive/log/LOG-rotate-761-for-776.md).
