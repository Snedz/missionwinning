# PLAN — Tempo on a finished set (`.1043`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1043`.
**Base:** master `c1dd3facfdd17074e0b9e177f9bf4ee296f31e10` — L/R on a finished set (`.1042`).
**Do not smash:** L/R `.1042`, RIR `.1041`, RPE `.1040`, Set kind `.1039`, Remove lift `.1038`, Add `.1037`, Replace `.1036`, Reorder `.1034`, remove-set, Name `.1007`, Edit sets `.997`, Delete-session `.1003`. Resume `.963` stays. Live pause `.1001` stays on Train. Live tempo `.734` / `.757` stays on Train. Live L/R/Alt `.724` / `.755` stays on Train. Live RIR 0–5 `.725` / `.756` stays on Train. Live RPE 1–10 `.967` stays on Train.

---

## The one thing

Optional tempo (eccentric-pause-concentric seconds) on a finished set. Live already has `parseOptionalTempo` / `SetTempoField` (`.734`). History edit cannot correct a logged tempo. Same finished log. Same id. Empty is valid (clear). Never required. Display is `e-p-c` (e.g. `3-1-1`). Each phase is an integer **0–9**. Out of range, 4-count strings, bare `311`, and NaN invent nothing — never clamped. Does not write `rpe` / `rpe10` / `rir` / `kind` / `side`. Does **not** call `rememberLastTempo` (that is live-logger last-used, via storage — History is a finished log). Save still confirm-gated `decideEditSave`.

## In / out

**In**

- Pure helper (no store): `src/lib/workout/patchFinishedSetTempo.ts`
  - Reuse `parseOptionalTempo` and `temposEqual` from `src/lib/workout/tempo.ts`. Never clamp.
  - `decidePatchFinishedSetTempo({ draft, exerciseIndex, setIndex, tempo })` returns
    - `{ kind: 'empty' }` missing draft / not an array / junk indexes
    - `{ kind: 'noop' }` out of range set index / same value as current (`temposEqual`)
    - Blank / null / undefined raw → clear (omit `tempo` field) unless current already omitted (noop).
    - Non-empty junk (`311`, `3-1-1-1`, `10-0-0`, `nope`, number, boolean) → empty.
    - `{ kind: 'apply'; draft }` patches via existing `patchDraftSet`. Clone source. To clear, omit the key — field absent, never stored undefined.
  - Does not write `rpe`, `rpe10`, `rir`, `kind`, or `side`. Does not write Wednesday / saved / live Start.
  - No `rememberLastTempo` / `readJson` / `writeJson` / `STORAGE_KEYS`.
- `sameEvidence` in `editFinishedSession.ts` must include tempo (`temposEqual`) so Save confirms when only tempo changes. `stripDraft` should omit an undefined `tempo` the same way it omits undefined `rir`.
- `HistorySessionEdit.tsx`: when `editing`, each set gets `SetTempoField` from `src/components/workout/SetTempoField.tsx`. testid `session-history-set-tempo-{exIdx}-{setIdx}`. Outline 44px. Draft only. L/R / RIR / RPE / set-kind stay.
- Save still existing Save → `decideEditSave`. L/R `.1042` / RIR `.1041` / RPE `.1040` / set kind `.1039` stay.
- History only. Guest. First set ungated. Today still one Start. Resume `.963` kept.
- Add `.1043` line to `src/lib/firstSetUngated.ts`.

**Out**

- Required tempo / clamp 10→9 / invent 3-1-1 from `311` / `rememberLastTempo` from History / Feed / Today chrome / skipping confirm
- Smashing live tempo `.734` or History L/R `.1042` / RIR `.1041`
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote
- `localStorage` (tempo.ts already uses safeStorage for live last-used — do not call it from this helper)
- Reps-only overload / Hevy RPE color / friends Feed

## Accept

```
npx tsx --test src/lib/workout/editFinishedSession.test.ts src/lib/workout/tempo.test.ts src/lib/firstSetUngated.test.ts src/lib/today/leanDockStart.test.ts src/lib/workout/patchFinishedSetTempo.test.ts src/lib/workout/patchFinishedSetTempoSurface.test.ts src/lib/workout/patchFinishedSetSide.test.ts src/lib/workout/patchFinishedSetSideSurface.test.ts
npx tsc --noEmit
npx tsx scripts/check-build-label.mjs
```
