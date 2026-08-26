# PLAN — Load % on a finished set (`.1044`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1044`.
**Base:** master `4dfc2d287256e457ae465613237a0d98731a5569` — Tempo on a finished set (`.1043`).
**Do not smash:** Tempo `.1043`, L/R `.1042`, RIR `.1041`, RPE `.1040`, Set kind `.1039`, Remove lift `.1038`, Add `.1037`, Replace `.1036`, Reorder `.1034`, remove-set, Name `.1007`, Edit sets `.997`, Delete-session `.1003`. Resume `.963` stays. Live pause `.1001` stays on Train. Live loadPct `.981` stays on Train. Live tempo `.734` / `.757` stays on Train. Live L/R/Alt `.724` / `.755` stays on Train. Live RIR 0–5 `.725` / `.756` stays on Train. Live RPE 1–10 `.967` stays on Train.

---

## The one thing

Optional percent of a known 1-rep max on a finished set. Live already has `parseOptionalLoadPct` (`.981` / `src/lib/workout/setRowPercent.ts`) and `SetRowPercentField` on the live table. History edit cannot correct a logged `loadPct`. Same finished log. Same id. Empty is valid (clear). Never required. Range **1–100**, one decimal (`76.5`). Trailing `%` allowed (`80%`). Out of range, extra decimals, junk invent nothing — never clamped. Does **not** invent a percent from the logged weight. Does **not** rewrite `weight` from the percent. No Epley. No `knownMaxFromHistory` / `weightFromKnownMaxPct` / `loadPctOfKnownMax` in this helper. Does not write `rpe` / `rpe10` / `rir` / `kind` / `side` / `tempo`. Save still confirm-gated `decideEditSave`.

## In / out

**In**

- Pure helper (no store): `src/lib/workout/patchFinishedSetLoadPct.ts`
  - Reuse `parseOptionalLoadPct` from `src/lib/workout/setRowPercent.ts`. Never clamp.
  - `decidePatchFinishedSetLoadPct({ draft, exerciseIndex, setIndex, loadPct })` returns
    - `{ kind: 'empty' }` missing draft / not an array / junk indexes
    - `{ kind: 'noop' }` out of range set index / same value as current
    - Blank / null / undefined raw → clear (omit `loadPct` field) unless current already omitted (noop).
    - Non-empty junk (`0`, `101`, `80.12`, `nope`, boolean) → empty.
    - `{ kind: 'apply'; draft }` patches via existing `patchDraftSet`. Clone source. To clear, omit the key — field absent, never stored undefined.
  - Does not write `weight`, `rpe`, `rpe10`, `rir`, `kind`, `side`, or `tempo`. Does not write Wednesday / saved / live Start.
  - No `weightFromKnownMaxPct` / `loadPctOfKnownMax` / `epley` / `workingMaxFromHistory` / `knownMaxFromHistory`.
- `sameEvidence` in `editFinishedSession.ts` must include loadPct (`parseOptionalLoadPct`) so Save confirms when only % changes. `stripDraft` should omit an undefined `loadPct` the same way it omits undefined `rir`.
- Compact authored-only control `src/components/workout/SetLoadPctField.tsx` — **SetTempoField parallel** (native input, empty default, outline 44px, no filled red, no computed cite from weight). Reuse i18n `activeSetPct` / `activeSetPctAria`. Optional `testId`.
- `HistorySessionEdit.tsx`: when `editing`, mount `SetLoadPctField` on **weight** row types only (`resolveSetRowType` === `'weight'`). testid `session-history-set-load-pct-{exIdx}-{setIdx}`. Outline 44px. Draft only. Tempo / L/R / RIR / RPE / set-kind stay.
- Save still existing Save → `decideEditSave`. Tempo `.1043` / L/R `.1042` / RIR `.1041` / RPE `.1040` / set kind `.1039` stay.
- History only. Guest. First set ungated. Today still one Start. Resume `.963` kept.
- Add `.1044` line to `src/lib/firstSetUngated.ts`.

**Out**

- Required % / invent % from kg / rewrite kg from % / Epley / Feed / Today chrome / skipping confirm
- Smashing live loadPct `.981` or History tempo `.1043`
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote
- `localStorage`
- Reps-only overload / Hevy RPE color / friends Feed

## Accept

```
npx tsx --test src/lib/workout/editFinishedSession.test.ts src/lib/workout/setRowPercent.test.ts src/lib/firstSetUngated.test.ts src/lib/today/leanDockStart.test.ts src/lib/workout/patchFinishedSetLoadPct.test.ts src/lib/workout/patchFinishedSetLoadPctSurface.test.ts src/lib/workout/patchFinishedSetTempo.test.ts src/lib/workout/patchFinishedSetTempoSurface.test.ts
npx tsc --noEmit
npx tsx scripts/check-build-label.mjs
```
