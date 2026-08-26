# PLAN — Replace this lift on a finished session (`.1036`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1036`.
**Base:** master `a5236f9865533cdbbc962653e5b7a4698d64c749` — Edit this session's logged duration (`.1035`).
**Do not smash:** Duration `.1035`, Reorder `.1034`, Name `.1007`, Edit sets `.997`, Move `.1027`, Copy `.1030`. Resume `.963` stays. Live pause `.1001` stays on Train.

---

## The one thing

History edit can change sets and reorder lifts. It cannot swap the movement they logged by mistake. Pick another exercise, keep the sets. Same finished log. Same id. Save still confirm-gated `decideEditSave`.

## In / out

**In**

- Pure helper (no store): `src/lib/workout/replaceFinishedExercise.ts`
  - `decideReplaceFinishedExercise({ draft, exerciseIndex, nextExerciseId })`
    - `{ kind: 'empty' }` missing draft / not an array / junk index / empty next id
    - `{ kind: 'noop' }` same exerciseId, unknown lift (`resolveExercise` returns nothing), out of range
    - `{ kind: 'apply'; draft: FinishedSessionDraft }` otherwise — that index's `exerciseId` becomes the new id, **sets ride unchanged** (clone sets so the source draft is not mutated)
  - Does not mint sets. Does not drop notes on the lift unless you must clone the exercise object. Does not write Wednesday / saved / live Start.
- `HistorySessionEdit.tsx`: when `editing`, each lift gets `ExercisePicker` (same component as `HistoryBackfill.tsx`) to replace. testid `session-history-replace-{exIdx}` on the wrap.
  - Apply to local draft only via the helper. Save is still existing Save → `decideEditSave` confirm. Do not add a second save.
  - Reorder up/down `.1034` stays.
- i18n: `historyReplaceLift` default `Replace lift` if you need a label.
- History only. Guest. First set ungated. Today still one Start. Resume `.963` kept.
- Add `.1036` line to `src/lib/firstSetUngated.ts`.
- Duration `.1035` / Reorder `.1034` / Edit `.997` / Copy `.1030` stay.

**Out**

- Inventing sets / wiping loads / rewriting Wednesday
- Second Start / Feed / Today chrome
- Skipping confirm / smashing `decideEditSave` or reorder
- New marketplace / shop / video required
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote
- `localStorage`

## Accept

```
npx tsx --test src/lib/workout/editFinishedSession.test.ts src/lib/workout/reorderFinishedExercises.test.ts src/lib/firstSetUngated.test.ts src/lib/today/leanDockStart.test.ts src/lib/workout/replaceFinishedExercise.test.ts src/lib/workout/replaceFinishedExerciseSurface.test.ts
npx tsc --noEmit
npx tsx scripts/check-build-label.mjs
```
