# PLAN — Superset on a finished session (`.1047`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1047`.
**Base:** master `89437956d39fbd93fc5a6b0bd9640bb7194e80cc` — Session note on a finished session (`.1046`).
**Do not smash:** Session note `.1046`, Lift note `.1045`, Load % `.1044`, Tempo `.1043`, L/R `.1042`, RIR `.1041`, RPE `.1040`, Set kind `.1039`, Remove lift `.1038`, Add `.1037`, Replace `.1036`, Reorder `.1034`, remove-set, Name `.1007`, Edit sets `.997`, Delete-session `.1003`. Resume `.963` stays. Live pause `.1001` stays on Train. Live superset `.980` stays on Train. Session note `.983` stays. Pin `.996` stays.

---

## The one thing

Optional exercise group (superset) on a finished History session. Live already has `src/lib/workout/superset.ts` / `supersetGroup` / `stripOrphanGroups` / "Superset w/ next" (`.980`). History edit cannot pair or unpair lifts on a finished log. Same finished log. Same id. Pair this lift with the **next**. Unpair (blank) clears this lift's group then `stripOrphanGroups` — an orphan is not a group. One lift / junk indexes empty. Already sharing a group with next → noop. Not a new SetKind. Not marketplace circuits. Does not rewrite sets / notes / duration / name. Save still confirm-gated `decideEditSave`.

## In / out

**In**

- Pure helper: `src/lib/workout/patchFinishedSuperset.ts` — **exercise-index** helper.
  - Reuse `stripOrphanGroups` from `src/lib/workout/superset.ts`. Do not rewrite pair-mark grammar.
  - `decidePatchFinishedSuperset({ draft, exerciseIndex, pair: true | false | 'next' | '' })`:
    - Missing draft / junk index → empty.
    - One-lift session → empty (cannot pair).
    - Last lift + pair-with-next → empty (no next).
    - `pair` true / `'next'` → share a group id with the next exercise (reuse existing group on either side if present; otherwise mint a short id). Same group already → noop.
    - `pair` false / `''` / blank → clear this lift's `supersetGroup`, then `stripOrphanGroups`. Already unpaired → noop.
  - Apply via clone of exercises. Does not rewrite sets / notes / `sessionNote` / duration.
- `draftsEqual` in `editFinishedSession.ts` must include `supersetGroup` (trimmed / omitted equal) so Save confirms when only pairing changes. `stripDraft` should omit an undefined group and still run `stripOrphanGroups`.
- `HistorySessionEdit.tsx`: when `editing` and 2+ lifts, outline 44px control per lift. testid `session-history-superset-{exIdx}`. Pair with next when a next lift exists; unpair when grouped. Draft only. Session note `.1046` / lift note `.1045` stay.
- Save still existing Save → `decideEditSave`.
- History only. Guest. First set ungated. Today still one Start. Resume `.963` kept.
- Add `.1047` line to `src/lib/firstSetUngated.ts`.

**Out**

- Required group / one-lift group / invent a third lift / marketplace circuits / Feed / smash live `.980` / skip confirm
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote
- `localStorage`
- Reps-only overload / Hevy RPE color / friends Feed

## Accept

```
npx tsx --test src/lib/workout/editFinishedSession.test.ts src/lib/firstSetUngated.test.ts src/lib/today/leanDockStart.test.ts src/lib/workout/patchFinishedSuperset.test.ts src/lib/workout/patchFinishedSupersetSurface.test.ts src/lib/workout/patchFinishedSessionNote.test.ts src/lib/workout/patchFinishedSessionNoteSurface.test.ts
npx tsc --noEmit
npx tsx scripts/check-build-label.mjs
```
