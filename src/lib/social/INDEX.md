# src/lib/social/

> One concern: Mission Server — local-first garage text rooms. Not a feed, not DMs, not voice.

## Agent resume card

- **Purpose:** One free Garage server per athlete, three text channels, device-local messages.
- **Non-goals:** Voice, DMs, Top 8, feed of logs, workout auto-post, Discord OAuth, WeChat order.
- **Entry files:** `store.ts`, `garage.ts`, `realtime.ts` · UI: `src/components/social/` · page: `/server`
- **Tests to run:** `src/lib/social/*.test.ts`, `src/lib/domainBoundary.test.ts`
- **Forbidden:** Import from `src/lib/coach/` or the logger path. Do not invent a second user id.
- **Horizon gate:** Founder override 2026-08-13 — parkable L2; freeze [docs/MISSION_SERVER_V1_PLAN.md](../../../docs/MISSION_SERVER_V1_PLAN.md).
- **Upstream contracts:** [docs/contracts/MODULE.md](../../../docs/contracts/MODULE.md) `social.server`, C1–C3.
- **Downstream consumers:** `ServerPage`, More sheet You tier.

## Read order

1. `types.ts` — caps and shapes
2. `garage.ts` — seed one Garage + three channels + self
3. `store.ts` — `safeStorage` persist
4. `callSign.ts` — operator name or `"Athlete"`
5. `realtime.ts` — fail-closed optional `supabase.channel` broadcast
