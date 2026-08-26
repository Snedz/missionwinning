# PLAN — Coach citation empty load is BW, not 0kg (`.1023`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1023`.
**Base:** master `934524eca` — Heatmap empty-load volume is reps, not 0 (`.1022`).
**Do not smash:** heatmap `.1022`, chat `.1021`, spark `.1020`, overdue `.1019`, month `.1018`.

---

## The one thing

`coachLogCitation` already refuses a 0 kg *set*. `coachCitationFact` still interpolates `weight` as a number, so a `kind: 'set'` with `weight: 0` would print `0kg × 8`.

Chat `.1021` already uses `formatSetLoadLine`. This formatter did not.

## In / out

**In**

- Empty-load `kind: 'set'` → `8 × BW` via `formatSetLoadLine`.
- Loaded stays `60kg × 5`.
- Guest. First set ungated.

**Out**

- Changing which set is quoted (still last loaded).
- Heatmap `.1022`. Today chrome. Promote.

## Verify

- `src/lib/coachCitationEmptyLoad.test.ts`
- `src/lib/coach/logCitation.test.ts`
