# PLAN — Coach chat empty load is BW, not 0 (`.1021`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1021`.
**Base:** master `8a606a12b` — Last cite is BW, not 0, on empty load (`.1017`).
**Do not smash:** `#843` `.1018`, `#845` `.1019`, `#846` `.1020`, logger cites `.1009`–`.1017`.

---

## The one thing

Coach chat interpolates stored `weight: 0` as `Push-ups 0 × 8`.

## In / out

**In**

- Chat log-fact display: empty load → `8 × BW`.
- `cite_last_log` / `lookup_recent_sets` / ReAct prompt share one helper.
- Loaded stays the existing `weight × reps` order.
- Display only. Store still `weight: 0`.

**Out**

- `logCitation` session-vs-set contract.
- Library spark (`.1020` in flight).
- Today chrome. `#843`. Promote.

## Verify

- `src/lib/coachChatEmptyLoad.test.ts`
