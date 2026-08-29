Superseded by LOG.md as of 2026-08-29 — rotated for `.1058` /active first paint.

## 2026-08-26 — RIR on a finished set (`.1041`)

Live already has optional 0–5 RIR on
a logged set (`parseOptionalRir` /
`SetRirSelect`, `.725`). History
edit `.997` could not correct a
logged RIR. Empty is valid. Never
required. Scale is 0–5 (do not
invent 0–10 — collides with RPE).

**Ship:** RIR on a finished set.
`decidePatchFinishedSetRir` empty
on missing draft / not an array /
junk indexes. 6 invents nothing —
never clamped. Noop on out of range
set index / same value as current.
Blank / null / undefined clears
(field omitted) unless already
omitted (noop). Apply patches
`rir` via `patchDraftSet`. Clone
so the source is not mutated. Does
not write `rpe` or `rpe10`. Does
not write Wednesday / saved / live
Start. History edit: outline 44px
`SetRirSelect` per set when
editing. Apply to local draft only.
Save still confirm-gated
`decideEditSave`. Same finished
log. Same id. Guest. First set
ungated. Today still one Start.
Resume `.963` kept. RPE `.1040` /
Set kind `.1039` / Remove lift
`.1038` / Add `.1037` / Replace
`.1036` / Reorder `.1034` /
remove-set stay. `/private` stays
the tight lock. No `PRIVATE_MODE`
flip.

Label `2026.07-unified.1041` (from
master `.1040` / `672bb5aec`). Stamp
stays `.1041`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1026-for-1041.md](docs/archive/log/LOG-rotate-1026-for-1041.md).
