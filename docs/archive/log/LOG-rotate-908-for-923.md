# Rotated from LOG.md for `.923`

## 2026-08-17 — Client writes close (`.908`)

A signed-in JWT could rewrite the nudge mailbox, plant a PFT
row on any class, list every PE join code, and upsert an
arbitrary leaderboard score. Those were client writes the
server treated as truth.

**Ship:** cron sends to verified `auth.users` email. PFT and
leaderboard standings go through service-role routes. Class
codes are not world-readable. Four `20260817_*.sql` files
still need applying on the hosted project.

Label `.908` (stacked on `.907`).

No `PRIVATE_MODE` flip.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-893-for-908.md](LOG-rotate-893-for-908.md).
