# PLAN — RIR on a finished set (`.1041`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1041`.
**Base:** master `672bb5aec720900ed7b5a894b11a3810c861302c` — RPE on a finished set (`.1040`).
**Do not smash:** RPE `.1040`, Set kind `.1039`, Remove lift `.1038`, Add `.1037`, Replace `.1036`, Reorder `.1034`, remove-set, Name `.1007`, Edit sets `.997`, Delete-session `.1003`. Resume `.963` stays. Live pause `.1001` stays on Train. Live RIR 0–5 `.725` / `.756` stays on Train. Live RPE 1–10 `.967` stays on Train.

---

## The one thing

Optional RIR 0–5 on a finished set. Live already has `parseOptionalRir` / `SetRirSelect` (`.725`). History edit cannot correct a logged RIR. Same finished log. Same id. Empty is valid (clear). Never required. Scale is **0–5** (do not invent 0–10 — collides with RPE). Never replaces `rpe` / `rpe10`. Save still confirm-gated `decideEditSave`.

## In / out

**In**

- Pure helper (no store): `src/lib/workout/patchFinishedSetRir.ts`
  - Reuse `parseOptionalRir` from `src/lib/workout/rir.ts`. Never clamp out-of-range into a number they did not give. Empty/blank/`null` → clear (`undefined`).
  - `decidePatchFinishedSetRir({ draft, exerciseIndex, setIndex, rir })` returns
    - `{ kind: 'empty' }` missing draft / not an array / junk indexes
    - `{ kind: 'noop' }` out of range set index / same value as current
    - For **explicit clear**: empty string / null / undefined raw that means clear → apply with `rir` omitted (delete the field). Distinguish junk "6" / "10" / "nope" (empty, invents nothing) from blank (clear). If raw is `''` | `null` | `undefined` → treat as clear (apply omit) unless current is already omitted (noop). If parseOptionalRir fails on a non-empty raw → empty.
    - `{ kind: 'apply'; draft }` patches via existing `patchDraftSet`. Clone source. To clear, omit the key — match how live logs store empty (field absent).
  - Does not write `rpe` or `rpe10`. Does not write Wednesday / saved / live Start.
- `sameEvidence` in `editFinishedSession.ts` must include RIR (same as RPE `.1040`) so Save confirms when only RIR changes.
- `HistorySessionEdit.tsx`: when `editing`, each set gets `SetRirSelect`. testid `session-history-set-rir-{exIdx}-{setIdx}`. Outline 44px. Draft only.
- Save still existing Save → `decideEditSave`. RPE `.1040` / set kind `.1039` stay.
- History only. Guest. First set ungated. Today still one Start. Resume `.963` kept.
- Add `.1041` line to `src/lib/firstSetUngated.ts`.

**Out**

- 0–10 RIR / required RIR / replacing RPE / Epley / Feed / Today chrome / skipping confirm
- Smashing live RIR or History RPE `.1040`
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote
- `localStorage`

## Accept

```
npx tsx --test src/lib/workout/editFinishedSession.test.ts src/lib/workout/rir.test.ts src/lib/firstSetUngated.test.ts src/lib/today/leanDockStart.test.ts src/lib/workout/patchFinishedSetRir.test.ts src/lib/workout/patchFinishedSetRirSurface.test.ts
npx tsc --noEmit
npx tsx scripts/check-build-label.mjs
```
