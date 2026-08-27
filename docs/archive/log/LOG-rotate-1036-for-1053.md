# Archived from LOG.md for `.1053` (Product IA skeleton)

Rotated 2026-08-27. Whole `##` section, order preserved.

## 2026-08-26 — Replace this lift on a finished session (`.1036`)

History edit `.997` can change sets.
Reorder `.1034` can move lifts. Neither
swaps the movement they logged by
mistake.

**Ship:** replace this lift on a finished
session. `decideReplaceFinishedExercise`
empty on missing draft / not an array /
junk index / empty next id. Noop on same
id, unknown lift, out of range. Apply
replaces that index's `exerciseId`; sets
ride unchanged (cloned). Does not mint
sets. Does not write Wednesday / saved /
live Start. History edit: `ExercisePicker`
per lift (same component as backfill).
Apply to local draft only. Save still
confirm-gated `decideEditSave`. Same
finished log. Same id. Guest. First set
ungated. Today still one Start. Resume
`.963` kept. Duration `.1035` / Reorder
`.1034` / Edit `.997` / Copy `.1030`
stay. `/private` stays the tight lock. No
`PRIVATE_MODE` flip.

Label `2026.07-unified.1036` (from
master `.1035` / `a5236f986`). Stamp
stays `.1036`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1021-for-1036.md](LOG-rotate-1021-for-1036.md).
