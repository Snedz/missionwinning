# src/lib/social/

> One concern: Mission Server messenger — local-first rooms, presence, and messages. Not a feed, not DMs, not Discord.com.

## Agent resume card

- **Purpose:** One free Garage, three text rooms, local presence, device-local messages. Signed-in posts ride the outbox to shared `social_messages`.
- **Non-goals:** Voice, DMs, Top 8, feed of logs, workout auto-post, Discord OAuth, games UI (AoE2 / PoGo / CoC — later horizon, same Mission ID).
- **Entry files:** `store.ts`, `garage.ts`, `cloud.ts`, `realtime.ts`, `../socialSync.ts` · UI: `src/components/social/` · page: `/server`
- **Tests to run:** `src/lib/social/*.test.ts` (incl. `isolation.test.ts`), `src/lib/socialSync.test.ts`, `src/lib/domainBoundary.test.ts`
- **Forbidden:** Import from `src/lib/coach/` or the logger path. Do not invent a second user id. Do not mount on Today / Train / AppLayout first paint. Coach chat does not share this store.
- **Product IA:** [docs/IA_SKELETON.md](../../../docs/IA_SKELETON.md) GARAGE loop.
- **Horizon gate:** Founder override 2026-08-13 — parkable L2; freeze [docs/MISSION_SERVER_MESSENGER_PLAN.md](../../../docs/MISSION_SERVER_MESSENGER_PLAN.md). Continues #518.
- **Upstream contracts:** [docs/contracts/MODULE.md](../../../docs/contracts/MODULE.md) `social.server`, C1–C3.
- **Downstream consumers:** `ServerPage`, More sheet You tier.

## Read order

1. `types.ts` — caps, presence, message kind
2. `garage.ts` — seed one Garage + three rooms + self
3. `store.ts` — `safeStorage` persist + presence
4. `callSign.ts` — operator name or `"Athlete"` + optional Mission ID
5. `cloud.ts` — row mapping + missing-table detect
6. `realtime.ts` — shared `mw-garage` broadcast + optional `postgres_changes`; fail open
7. `../socialSync.ts` — outbox kinds; guests never enqueue
