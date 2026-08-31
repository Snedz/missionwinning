# Rotated from LOG.md for `.1060`

## 2026-08-26 — Tempo on a finished set (`.1043`)

Live already has optional e-p-c
tempo on a logged set
(`parseOptionalTempo` /
`SetTempoField`, `.734`). History
edit `.997` could not correct a
logged tempo. Empty is valid.
Never required. Display is
`e-p-c` (e.g. `3-1-1`). Each
phase is an integer 0–9. Out of
range, 4-count, bare `311`, and
NaN invent nothing — never
clamped.

**Ship:** Tempo on a finished set.
`decidePatchFinishedSetTempo` empty
on missing draft / not an array /
junk indexes. `311` / `3-1-1-1` /
`10-0-0` / `nope` / number /
boolean invent nothing. Noop on
out of range set index / same
value as current (`temposEqual`).
Blank / null / undefined clears
(field omitted) unless already
omitted (noop). Apply patches
`tempo` via `patchDraftSet`. Clone
so the source is not mutated. Does
not write `rpe` / `rpe10` / `rir` /
`kind` / `side`. Does not call
`rememberLastTempo`. Does not write
Wednesday / saved / live Start.
History edit: outline 44px
`SetTempoField` per set when
editing. Apply to local draft
only. Save still confirm-gated
`decideEditSave`. Same finished
log. Same id. Guest. First set
ungated. Today still one Start.
Resume `.963` kept. L/R `.1042` /
RIR `.1041` / RPE `.1040` / Set
kind `.1039` / Remove lift `.1038`
/ Add `.1037` / Replace `.1036` /
Reorder `.1034` / remove-set stay.
`/private` stays the tight lock.
No `PRIVATE_MODE` flip.

Label `2026.07-unified.1043` (from
master `.1042` / `c1dd3facf`). Stamp
stays `.1043`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1028-for-1043.md](docs/archive/log/LOG-rotate-1028-for-1043.md).
