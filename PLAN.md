# PLAN — Completed set-table empty load is BW, not 0 (`.1025`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1025`.
**Base:** master `72685e9b` — History empty-load volume is reps, not 0 kg (`.1024`).
**Do not smash:** History volume `.1024`, citation `.1023`, heatmap `.1022`, chat `.1021`.

---

## The one thing

Logger cites already print `8 × BW`. The completed kg cell still painted stored `weight: 0` as `0`.

## In / out

**In**

- `formatCompletedWeightCell` — empty is `BW`; loaded barbell stays the number; plus-load extra stays `BW+N`.
- Display only. Store still `weight: 0`.
- Guest. First set ungated. Today still one Start.

**Out**

- Assisted 0 mute (`—`) — later hop.
- History volume `.1024`. Citation `.1023`. Heatmap `.1022`. Today chrome. Promote.

## Verify

- `src/lib/workout/setTableEmptyLoadCell.test.ts`
