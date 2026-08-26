# PLAN — Add a lift to this finished session (`.1037`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1037`.
**Base:** master `3408cbfef6f72c79e49e951da78384393f1b94ad` — Replace this lift on a finished session (`.1036`).
**Do not smash:** Replace `.1036`, Duration `.1035`, Reorder `.1034`, Name `.1007`, Edit sets `.997`, Backfill `.1000`. Resume `.963` stays. Live pause `.1001` stays on Train.

---

## The one thing

History edit can change sets, reorder, and replace a lift. It cannot add a movement they forgot. Backfill `.1000` is a new row. Add set (`appendDraftSet`) is on an existing lift. Same finished log. Same id. Save still confirm-gated `decideEditSave`. Reuse `ExercisePicker` (already on Backfill and Replace `.1036`).

## In / out

**In**

- Pure helper (no store): `src/lib/workout/appendFinishedExercise.ts`
  - `decideAppendFinishedExercise({ draft, nextExerciseId })`
    - `{ kind: 'empty' }` missing draft / not an array / empty next id
    - `{ kind: 'noop' }` unknown lift (same known-lift check as replace: `resolveExercise` + catalog or custom id)
    - `{ kind: 'apply'; draft }` appends `{ exerciseId, sets: [{ reps: 0, weight: 0 }] }` — same empty set as `appendDraftSet`. Existing lifts unchanged. Clone so source draft is not mutated.
  - Duplicate lift ids are allowed. Do not treat duplicate as noop.
  - Does not invent loads. Does not write Wednesday / saved / live Start.
- `HistorySessionEdit.tsx`: when `editing`, one block at the bottom: label + `ExercisePicker`. testid `session-history-add-lift`. Outline 44px if you add a button; picker-onChange is enough if that matches Replace.
  - i18n `historyAddLift` default `Add a lift`.
  - Apply to local draft only. Save still existing Save → `decideEditSave`. Empty 0/0 still needs evidence — existing honesty, do not weaken it.
- Replace `.1036` / Reorder `.1034` / Duration `.1035` / Edit `.997` / Backfill `.1000` stay.
- History only. Guest. First set ungated. Today still one Start. Resume `.963` kept.
- Add `.1037` line to `src/lib/firstSetUngated.ts`.

**Out**

- Second backfill / minting a new session / Feed / Today chrome
- Inventing loads / skipping confirm / smashing replace or edit
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote
- `localStorage`

## Accept

```
npx tsx --test src/lib/workout/editFinishedSession.test.ts src/lib/workout/replaceFinishedExercise.test.ts src/lib/firstSetUngated.test.ts src/lib/today/leanDockStart.test.ts src/lib/workout/appendFinishedExercise.test.ts src/lib/workout/appendFinishedExerciseSurface.test.ts
npx tsc --noEmit
npx tsx scripts/check-build-label.mjs
```
