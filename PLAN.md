# PLAN — Library spark is reps, not 0, on empty load (`.1020`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1020`.
**Base:** master `8a606a12b` — Last cite is BW, not 0, on empty load (`.1017`).
**Do not smash:** `#843` `.1018` Month they own, `#845` `.1019` never-trained overdue, `.1017` empty-load cite, `.1016` session file, `.1010` Library tomb skip.

---

## The one thing

Library volume spark plots `8 × 0` as zero. Eight push-ups look like they did nothing.

Cite stack already prints BW. Store still `weight: 0`. Spark still does `reps * weight`.

## Why this, why now

Year-one metric is week-4 loggers. `.1010` made the spark skip tombs. The line still lies on bodyweight. `#843` / `#845` are in flight; this hop is `.1020`.

## In / out

**In**

- `libraryExerciseVolumeSpark`: performed empty-load working sets score as reps.
- Loaded kg unchanged (`5 × 80` → 400).
- Warmups stay out. Tombs stay out. Empty invents nothing.
- Guest. First set ungated.

**Out**

- History `calculateVolume` / Victory totals (kg-honest).
- Coach chat `0 × 8`.
- `#843` Month. `#845` anatomy.
- Today chrome, Feed, `/private`.
- Promote. Live www stays `.696`.

## Done when

1. Push-ups `8 × 0` spark is `[8]`, not `[0]`.
2. Loaded spark still kg. Empty diary still `[]`.
3. Today still one Start. First set ungated.

## Verify

- `src/lib/librarySparkBw.test.ts`
- `npx tsx --test src/lib/libraryFilters.test.ts src/lib/librarySkipTombsSurface.test.ts`
- `npx tsx scripts/check-build-label.mjs` — `.1020` > master `.1017`.
