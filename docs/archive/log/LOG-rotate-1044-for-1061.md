# Rotated from LOG.md for `.1061`

## 2026-08-26 — Load % on a finished set (`.1044`)

Live already has optional % of a
known 1-rep max on a logged set
(`parseOptionalLoadPct` / live
`SetRowPercentField`, `.981`).
History edit `.997` could not
correct a logged `loadPct`. Empty
is valid. Never required. Range
1–100, one decimal (`76.5`).
Trailing `%` allowed (`80%`). Out
of range, extra decimals, and junk
invent nothing — never clamped.
Does not invent a percent from kg.
Does not rewrite kg from %.

**Ship:** Load % on a finished set.
`decidePatchFinishedSetLoadPct`
empty on missing draft / not an
array / junk indexes. `0` / `101`
/ `80.12` / `nope` / boolean invent
nothing. Noop on out of range set
index / same value as current.
Blank / null / undefined clears
(field omitted) unless already
omitted (noop). Apply patches
`loadPct` via `patchDraftSet`.
Clone so the source is not mutated.
Does not write `weight` / `rpe` /
`rpe10` / `rir` / `kind` / `side`
/ `tempo`. Does not call
`knownMaxFromHistory` /
`weightFromKnownMaxPct` /
`loadPctOfKnownMax`. Does not write
Wednesday / saved / live Start.
History edit: outline 44px
`SetLoadPctField` on weight rows
when editing. Apply to local draft
only. Save still confirm-gated
`decideEditSave`. Same finished
log. Same id. Guest. First set
ungated. Today still one Start.
Resume `.963` kept. Tempo `.1043` /
L/R `.1042` / RIR `.1041` / RPE
`.1040` / Set kind `.1039` stay.
`/private` stays the tight lock.
No `PRIVATE_MODE` flip.

Label `2026.07-unified.1044` (from
master `.1043` / `4dfc2d287`). Stamp
stays `.1044`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1029-for-1044.md](docs/archive/log/LOG-rotate-1029-for-1044.md).
