## 2026-08-26 — RPE on a finished set (`.1040`)

Live already has optional 1–10 RPE on
a logged set (`parseOptionalRpe10` /
`SetRpe10Select`, `.967`). History
edit `.997` could not correct a
logged RPE. Empty is valid. Never
required.

**Ship:** RPE on a finished set.
`decidePatchFinishedSetRpe10` empty
on missing draft / not an array /
junk indexes. 99 invents nothing —
never clamped. Noop on out of range
set index / same value as current.
Blank / null / undefined clears
(field omitted) unless already
omitted (noop). Apply patches
`rpe10` via `patchDraftSet`. Clone
so the source is not mutated. Does
not write categorical `rpe`. Does
not write Wednesday / saved / live
Start. History edit: outline 44px
`SetRpe10Select` per set when
editing. Paper/ink tokens only.
Apply to local draft only. Save
still confirm-gated
`decideEditSave`. Same finished
log. Same id. Guest. First set
ungated. Today still one Start.
Resume `.963` kept. Set kind
`.1039` / Remove lift `.1038` /
Add `.1037` / Replace `.1036` /
Reorder `.1034` / remove-set stay.
`/private` stays the tight lock.
No `PRIVATE_MODE` flip.

Label `2026.07-unified.1040` (from
master `.1039` / `a11cd01ee`). Stamp
stays `.1040`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1025-for-1040.md](docs/archive/log/LOG-rotate-1025-for-1040.md).
