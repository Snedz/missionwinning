# Rotated from LOG.md for `.1059`

## 2026-08-26 — L/R on a finished set (`.1042`)

Live already has optional L / R / Alt
on a logged set (`parseSetSide` /
`SET_SIDES` / `shouldOfferSetSide` /
LogConsole chips, `.724`). History
edit `.997` could not correct a
logged side. Empty is valid. Never
required. Values are `L` | `R` |
`alt` (do not invent `left` /
`Left` / 0–1). Never a SetKind.

**Ship:** L/R on a finished set.
`decidePatchFinishedSetSide` empty
on missing draft / not an array /
junk indexes. `left` / `Left` /
`normal` / `1` invent nothing.
Squat / bench + L/R/alt invents
nothing — never persist a side on
bilateral. Noop on out of range
set index / same value as current.
Blank / null / undefined clears
(field omitted) unless already
omitted (noop). Apply patches
`side` via `patchDraftSet`. Clone
so the source is not mutated. Does
not write `rpe` / `rpe10` / `rir` /
`kind`. Does not write Wednesday /
saved / live Start. History edit:
outline 44px `SetSideSelect` only
when `shouldOfferSetSide` on the
resolved exercise. Apply to local
draft only. Save still
confirm-gated `decideEditSave`.
Same finished log. Same id. Guest.
First set ungated. Today still one
Start. Resume `.963` kept. RIR
`.1041` / RPE `.1040` / Set kind
`.1039` / Remove lift `.1038` /
Add `.1037` / Replace `.1036` /
Reorder `.1034` / remove-set stay.
`/private` stays the tight lock.
No `PRIVATE_MODE` flip.

Label `2026.07-unified.1042` (from
master `.1041` / `e0072ec12`). Stamp
stays `.1042`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1027-for-1042.md](docs/archive/log/LOG-rotate-1027-for-1042.md).
