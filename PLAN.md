# PLAN — L/R on a finished set (`.1042`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1042`.
**Base:** master `e0072ec1241d576459c3715616b9d4b4450760a1` — RIR on a finished set (`.1041`).
**Do not smash:** RIR `.1041`, RPE `.1040`, Set kind `.1039`, Remove lift `.1038`, Add `.1037`, Replace `.1036`, Reorder `.1034`, remove-set, Name `.1007`, Edit sets `.997`, Delete-session `.1003`. Resume `.963` stays. Live pause `.1001` stays on Train. Live L/R/Alt `.724` / `.755` stays on Train. Live RIR 0–5 `.725` / `.756` stays on Train. Live RPE 1–10 `.967` stays on Train.

---

## The one thing

Optional L / R / Alt on a finished set. Live already has `parseSetSide` / `SET_SIDES` / `shouldOfferSetSide` / LogConsole chips (`.724`). History edit cannot correct a logged side. Same finished log. Same id. Empty is valid (clear). Never required. Values are **`L` | `R` | `alt`** (do not invent `left` / `Left` / 0–1). Never a SetKind (warmup/drop stay classification). Bilateral / unknown lift invents nothing (`persistableSetSide` / `shouldOfferSetSide`). Does not write `rpe` / `rpe10` / `rir` / `kind`. Save still confirm-gated `decideEditSave`.

## In / out

**In**

- Pure helper (no store): `src/lib/workout/patchFinishedSetSide.ts`
  - Reuse `parseSetSide`, `shouldOfferSetSide` / `isUnilateralExercise`, `persistableSetSide` from `src/lib/workout/unilateral.ts`. Never clamp. Never rewrite `UNILATERAL_RE`.
  - `decidePatchFinishedSetSide({ draft, exerciseIndex, setIndex, side })` returns
    - `{ kind: 'empty' }` missing draft / not an array / junk indexes
    - `{ kind: 'noop' }` out of range set index / same value as current
    - Blank / null / undefined raw → clear (omit `side` field) unless current already omitted (noop).
    - Non-empty junk (`left`, `Left`, `normal`, `1`) → empty.
    - Non-unilateral exercise (squat / bench) with L/R/alt → empty. Do not persist a side on bilateral.
    - `{ kind: 'apply'; draft }` patches via existing `patchDraftSet`. Clone source. To clear, omit the key — field absent, never stored undefined.
  - Does not write `rpe`, `rpe10`, `rir`, or `kind`. Does not write Wednesday / saved / live Start.
- `sameEvidence` in `editFinishedSession.ts` must include side (`parseSetSide`) so Save confirms when only side changes. `stripDraft` should omit an undefined `side` the same way it omits undefined `rir`.
- New compact control `src/components/workout/SetSideSelect.tsx` — SetRirSelect parallel (native `<select>`, empty default, outline 44px, no filled red). Options from `SET_SIDES`. Reuse i18n keys `activeSetSideL` / `activeSetSideR` / `activeSetSideAlt` / `activeSetSideAria` (do not mint a second pack). Optional `testId`.
- `HistorySessionEdit.tsx`: when `editing`, mount `SetSideSelect` **only** if `shouldOfferSetSide` on the resolved exercise (id + name). testid `session-history-set-side-{exIdx}-{setIdx}`. Outline 44px. Draft only. RIR / RPE / set-kind stay.
- Save still existing Save → `decideEditSave`. RIR `.1041` / RPE `.1040` / set kind `.1039` stay.
- History only. Guest. First set ungated. Today still one Start. Resume `.963` kept.
- Add `.1042` line to `src/lib/firstSetUngated.ts`.

**Out**

- Required side / invent side on squat / treat `alt` as a SetKind / rewrite `UNILATERAL_RE` / Feed / Today chrome / skipping confirm
- Smashing live side `.724` or History RIR `.1041` / RPE `.1040`
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote
- `localStorage`
- Tempo / reps-only overload / Hevy RPE color / friends Feed

## Accept

```
npx tsx --test src/lib/workout/editFinishedSession.test.ts src/lib/workout/unilateral.test.ts src/lib/firstSetUngated.test.ts src/lib/today/leanDockStart.test.ts src/lib/workout/patchFinishedSetSide.test.ts src/lib/workout/patchFinishedSetSideSurface.test.ts src/lib/workout/patchFinishedSetRir.test.ts src/lib/workout/patchFinishedSetRirSurface.test.ts
npx tsc --noEmit
npx tsx scripts/check-build-label.mjs
```
