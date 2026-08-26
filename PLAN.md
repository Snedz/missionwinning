# PLAN — Never-trained is not overdue (`.1019`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1019`.
**Base:** master `8a606a12b` — Last cite is BW, not 0, on empty load (`.1017`).
**Do not smash:** `#843` Month they own (`.1018` in flight), `.1017` empty-load cite, `.1016` session file, cite stack `.1015`–`.1009`.

---

## The one thing

Never-trained is not overdue.

Anatomy paints `daysSince >= 7` as overdue. Never-trained is `days = 99` / `sessions = 0`, so Chest they have never logged reads as a missed session. Grid heatmap already treats `>= 99` as idle. Score keeps the 99 sentinel.

## Why this, why now

Year-one metric is week-4 loggers. Shame on a muscle they never trained is a lie. `#843` owns `.1018`; this hop skips to `.1019`.

## In / out

**In**

- Anatomy overdue only if they trained that group (`sessions > 0`) and `daysSince >= 7`.
- Never-trained stays idle — not red, not “· overdue”.
- History / Benchmarks share the helper.

**Out**

- Changing `days = 99` in readiness / score.
- Restyling `MuscleHeatmap`.
- Library spark 0. `#843`. Today chrome. Promote. `PRIVATE_MODE`.

## Done when

1. Empty diary: six groups not overdue.
2. Trained 10 days ago still overdue.
3. Today still one Start. First set ungated.

## Verify

- `src/lib/neverTrainedOverdue.test.ts`
- `npx tsx --test src/lib/firstSetUngated.ts`
- `npx tsx scripts/check-build-label.mjs` — `.1019` > master `.1017`.
