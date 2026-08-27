# Rotated from LOG.md for `.1056`

Moved so LOG.md stays at the 15-entry cap.

## 2026-08-26 — Set kind on a finished set (`.1039`)

History edit `.997` shows set kind as
a badge. Live already has W/D/F via
`toggleSetTag` (`.966`). They cannot
mark a warmup they logged as work (or
the reverse).

**Ship:** set kind on a finished set.
`decidePatchFinishedSetKind` empty on
missing draft / not an array / junk
indexes / unknown kind. Noop on out of
range / same kind as current (missing
current is `'normal'`). Apply patches
that set's `kind` via `patchDraftSet`.
Clone so the source is not mutated.
`cycleFinishedSetKind` uses
`toggleSetTag`. Warmup still excluded
from volume. Does not write Wednesday /
saved / live Start. History edit:
outline 44px kind control per set when
editing. Apply to local draft only.
Save still confirm-gated
`decideEditSave`. Same finished log.
Same id. Guest. First set ungated.
Today still one Start. Resume `.963`
kept. Remove lift `.1038` / Add `.1037`
/ Replace `.1036` / Reorder `.1034` /
remove-set stay. `/private` stays the
tight lock. No `PRIVATE_MODE` flip.

Label `2026.07-unified.1039` (from
master `.1038` / `1dac3fb4b`). Stamp
stays `.1039`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1024-for-1039.md](docs/archive/log/LOG-rotate-1024-for-1039.md).
