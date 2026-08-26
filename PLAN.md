# PLAN — Set kind on a finished set (`.1039`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1039`.
**Base:** master `1dac3fb4b6d5542ce2d39b8a2b030efe16c27264` — Remove this lift from a finished session (`.1038`).
**Do not smash:** Remove lift `.1038`, Add `.1037`, Replace `.1036`, Reorder `.1034`, remove-set, Name `.1007`, Edit sets `.997`, Delete-session `.1003`. Resume `.963` stays. Live pause `.1001` stays on Train. Live W/D/F `.966` stays on Train.

---

## The one thing

History edit shows set kind as a badge. They cannot mark a warmup they logged as work (or the reverse). Live already has W/D/F via `toggleSetTag` (`.966`). Same finished log. Same id. Save still confirm-gated `decideEditSave`. Do not fork kinds.

## In / out

**In**

- Pure helper (no store): `src/lib/workout/patchFinishedSetKind.ts`
  - `decidePatchFinishedSetKind({ draft, exerciseIndex, setIndex, kind })` returns
    - `{ kind: 'empty' }` missing draft / not an array / junk indexes / unknown kind (not in `SET_KINDS`)
    - `{ kind: 'noop' }` out of range / same kind as current (treat missing current as `'normal'`)
    - `{ kind: 'apply'; draft }` patches that set's `kind` via existing `patchDraftSet`. Clone so source is not mutated.
  - `cycleFinishedSetKind(current)` using `toggleSetTag` — History edit is tap-to-cycle. Still validate through decide.
  - Warmup still excluded from volume (`countsTowardVolume`) — do not change that rule.
- `HistorySessionEdit.tsx`: when `editing`, each set gets outline 44px kind control. testid `session-history-set-kind-{exIdx}-{setIdx}`. Draft only.
  - i18n: reuse existing set-kind label keys (`setKindLabelKey`); do not invent a fourth kind.
  - Save still existing Save → `decideEditSave`.
- Remove lift `.1038` / Add `.1037` / Replace `.1036` / Reorder `.1034` / remove-set stay.
- History only. Guest. First set ungated. Today still one Start. Resume `.963` kept.
- Add `.1039` line to `src/lib/firstSetUngated.ts`.

**Out**

- New set types / Epley / Feed / Today chrome / skipping confirm
- Rewriting `countsTowardVolume` / live logger tags
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote
- `localStorage`

## Accept

```
npx tsx --test src/lib/workout/editFinishedSession.test.ts src/lib/workout/setKind.test.ts src/lib/firstSetUngated.test.ts src/lib/today/leanDockStart.test.ts src/lib/workout/patchFinishedSetKind.test.ts src/lib/workout/patchFinishedSetKindSurface.test.ts
npx tsc --noEmit
npx tsx scripts/check-build-label.mjs
```
