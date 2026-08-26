# PLAN — Remove this lift from a finished session (`.1038`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1038`.
**Base:** master `b5cbfd21c8d967ba8085ed6db1d71a6b3259d3d8` — Add a lift to this finished session (`.1037`).
**Do not smash:** Add `.1037`, Replace `.1036`, Duration `.1035`, Reorder `.1034`, remove-set, Name `.1007`, Edit sets `.997`, Delete-session `.1003`. Resume `.963` stays. Live pause `.1001` stays on Train.

---

## The one thing

History edit can add a lift (`.1037`), replace (`.1036`), reorder (`.1034`), and remove a **set** (`removeDraftSet`). It cannot drop a whole movement they added by mistake. Session delete `.1003` is the **whole log**. Same id. Save still confirm-gated `decideEditSave`. Last remaining lift is noop — they already have delete-session.

## In / out

**In**

- Pure helper (no store): `src/lib/workout/removeFinishedExercise.ts`
  - `decideRemoveFinishedExercise({ draft, exerciseIndex })` returns
    - `{ kind: 'empty' }` missing draft / not an array / junk index
    - `{ kind: 'noop' }` out of range / only one lift left
    - `{ kind: 'apply'; draft }` splices that index out. Clone. Other lifts unchanged.
  - Does not write Wednesday / saved / live Start. Does not tomb the session.
- `HistorySessionEdit.tsx`: when `editing` and `draft.exercises.length >= 2`, outline 44px **Remove lift** per lift (not the existing Remove set). testid `session-history-remove-lift-{exIdx}`. Draft only.
  - i18n `historyRemoveLift` default `Remove lift`.
  - Save still existing Save → `decideEditSave`.
- Add `.1037` / Replace `.1036` / Reorder `.1034` / Duration `.1035` / remove-set / delete-session `.1003` stay.
- History only. Guest. First set ungated. Today still one Start. Resume `.963` kept.
- Add `.1038` line to `src/lib/firstSetUngated.ts`.

**Out**

- Wiping the whole session / Feed / Today chrome / skipping confirm
- Smashing `removeDraftSet` or add-lift
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote
- `localStorage`

## Accept

```
npx tsx --test src/lib/workout/editFinishedSession.test.ts src/lib/workout/appendFinishedExercise.test.ts src/lib/firstSetUngated.test.ts src/lib/today/leanDockStart.test.ts src/lib/workout/removeFinishedExercise.test.ts src/lib/workout/removeFinishedExerciseSurface.test.ts
npx tsc --noEmit
npx tsx scripts/check-build-label.mjs
```
