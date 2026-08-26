# PLAN — RPE on a finished set (`.1040`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1040`.
**Base:** master `a11cd01ee9aae03a65d5827c0634eaabd3f06696` — Set kind on a finished set (`.1039`).
**Do not smash:** Set kind `.1039`, Remove lift `.1038`, Add `.1037`, Replace `.1036`, Reorder `.1034`, remove-set, Name `.1007`, Edit sets `.997`, Delete-session `.1003`. Resume `.963` stays. Live pause `.1001` stays on Train. Live RPE 1–10 `.967` stays on Train.

---

## The one thing

Optional RPE 1–10 on a finished set. Live already has `parseOptionalRpe10` / `SetRpe10Select` (`.967`). History edit cannot correct a logged RPE. Same finished log. Same id. Empty is valid (clear). Never required. Save still confirm-gated `decideEditSave`. Paper/ink, existing tokens only.

## In / out

**In**

- Pure helper (no store): `src/lib/workout/patchFinishedSetRpe10.ts`
  - Reuse `parseOptionalRpe10` from `src/lib/workout/rpe10.ts`. Never clamp out-of-range into a number they did not give. Empty/blank/`null` → clear (`undefined`).
  - `decidePatchFinishedSetRpe10({ draft, exerciseIndex, setIndex, rpe10 })` returns
    - `{ kind: 'empty' }` missing draft / not an array / junk indexes
    - `{ kind: 'noop' }` out of range set index / same value as current
    - For **explicit clear**: empty string / null / undefined raw that means clear → apply with `rpe10` omitted (delete the field). Distinguish junk "99" (empty, invents nothing) from blank (clear). If raw is `''` | `null` | `undefined` → treat as clear (apply omit) unless current is already omitted (noop). If parseOptionalRpe10 fails on a non-empty raw → empty.
    - `{ kind: 'apply'; draft }` patches via existing `patchDraftSet`. Clone source. To clear, omit the key — match how live logs store empty (field absent).
  - Does not write categorical `rpe`. Does not write Wednesday / saved / live Start.
- `HistorySessionEdit.tsx`: when `editing`, each set gets RPE control. Reuse `SetRpe10Select`. testid `session-history-set-rpe-{exIdx}-{setIdx}`. Outline 44px. No color scale. Draft only.
- Save still existing Save → `decideEditSave`. Set kind `.1039` stays.
- History only. Guest. First set ungated. Today still one Start. Resume `.963` kept.
- Add `.1040` line to `src/lib/firstSetUngated.ts`.

**Out**

- Color-scale RPE as identity / required RPE / inventing 1–10 from Easy/Med/Hard / Epley
- Feed / Today chrome / skipping confirm / smashing live `.967` or set kind `.1039`
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote
- `localStorage`

## Accept

```
npx tsx --test src/lib/workout/editFinishedSession.test.ts src/lib/workout/rpe10.test.ts src/lib/firstSetUngated.test.ts src/lib/today/leanDockStart.test.ts src/lib/workout/patchFinishedSetRpe10.test.ts src/lib/workout/patchFinishedSetRpe10Surface.test.ts
npx tsc --noEmit
npx tsx scripts/check-build-label.mjs
```
