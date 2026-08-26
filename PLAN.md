# PLAN — Lift note on a finished exercise (`.1045`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1045`.
**Base:** master `64277eb801781b13aa8bcab65eb4f6eb98622511` — Load % on a finished set (`.1044`).
**Do not smash:** Load % `.1044`, Tempo `.1043`, L/R `.1042`, RIR `.1041`, RPE `.1040`, Set kind `.1039`, Remove lift `.1038`, Add `.1037`, Replace `.1036`, Reorder `.1034`, remove-set, Name `.1007`, Edit sets `.997`, Delete-session `.1003`. Resume `.963` stays. Live pause `.1001` stays on Train. Live exercise note `.996` stays on Train. Session note `.983` stays. Pin `.996` stays. Live loadPct `.981` stays on Train.

---

## The one thing

Optional per-lift diary on a finished exercise. Live already has `exerciseNote.ts` / `EXERCISE_NOTE_MAX` 200 (`.996`). History edit **displays** `ex.note` as italic and cannot correct it. `draftsEqual` currently ignores notes, so a typed note would Save as noop. Same finished log. Same id. Empty is valid (clear). Never required. Over-cap **truncates** at 200 (same as `normalizeSessionNote` — do not empty). Not a pin (`exercisePin.ts`). Not `sessionNote` (`.983`). Not Feed / comments / likes / LLM. Does not write sets. Save still confirm-gated `decideEditSave`.

## In / out

**In**

- Add `normalizeExerciseNote` in `src/lib/workout/exerciseNote.ts` if missing — trim; empty / non-string → `undefined`; over-cap truncate at `EXERCISE_NOTE_MAX`. Never pad. Never invent from volume. Never call `lastNotesFor` / cueMemory / LLM from this helper.
- Pure helper: `src/lib/workout/patchFinishedExerciseNote.ts` — **exercise-index** mirror of set helpers (not `patchDraftSet`).
  - Blank/null/undefined raw → clear (omit `note` field) unless current already omitted (noop).
  - Non-string junk → empty.
  - Same normalized text → noop.
  - Apply via clone of the exercise (`{ ...ex, note }`). Does not rewrite sets / `sessionNote` / pin.
- `draftsEqual` in `editFinishedSession.ts` must include the lift note (`normalizeExerciseNote(a.note) === normalizeExerciseNote(b.note)`) so Save confirms when only the note changes. `stripDraft` should omit an undefined `note`.
- `HistorySessionEdit.tsx`: when `editing`, a textarea for the lift note. testid `session-history-lift-note-{exIdx}`. Outline 44px. min-h 44px. Draft only. Read-only italic stays when not editing. Load % `.1044` / tempo `.1043` / L/R / RIR / RPE stay.
- Save still existing Save → `decideEditSave`.
- History only. Guest. First set ungated. Today still one Start. Resume `.963` kept.
- Add `.1045` line to `src/lib/firstSetUngated.ts`.

**Out**

- Required note / Feed / comments / likes / LLM rewrite / smash pin `.996` / smash `sessionNote` `.983` / skip confirm
- Smashing live exercise notes or History load % `.1044`
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote
- `localStorage`
- Reps-only overload / Hevy RPE color / friends Feed

## Accept

```
npx tsx --test src/lib/workout/editFinishedSession.test.ts src/lib/workout/exerciseNote.test.ts src/lib/firstSetUngated.test.ts src/lib/today/leanDockStart.test.ts src/lib/workout/patchFinishedExerciseNote.test.ts src/lib/workout/patchFinishedExerciseNoteSurface.test.ts src/lib/workout/patchFinishedSetLoadPct.test.ts src/lib/workout/patchFinishedSetLoadPctSurface.test.ts
npx tsc --noEmit
npx tsx scripts/check-build-label.mjs
```
