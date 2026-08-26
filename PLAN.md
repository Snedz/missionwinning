# PLAN — Heatmap empty-load volume is reps, not 0 (`.1022`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1022`.
**Base:** master `710d0b7de` — Coach chat empty load is BW, not 0 (`.1021`).
**Do not smash:** `.1021` chat cite, `.1020` library spark, `.1019` never-trained overdue, `.1018` month.

---

## The one thing

Anatomy heatmap still sums `reps * weight`. Eight push-ups add 0 volume, so a trained group looks idle.

Library spark `.1020` already scores empty load as reps. Heatmap did not follow.

## In / out

**In**

- One helper `workingSetVolume`: empty load → reps; loaded → reps × kg.
- `buildMuscleHeatmap` uses it.
- Spark reuses it (no second copy).
- Guest. First set ungated.

**Out**

- History `calculateVolume` kg totals.
- Score 99 sentinel. Month they own.
- Today chrome. Promote. `PRIVATE_MODE`.

## Verify

- `src/lib/heatmapEmptyLoadVolume.test.ts`
- `src/lib/librarySparkBw.test.ts`
