# Archived from LOG.md for `.1054` (v0 catalog labeling)

Rotated 2026-08-27. Whole `##` section, order preserved.

## 2026-08-26 — Add a lift to this finished session (`.1037`)

History edit `.997` can change sets.
Reorder `.1034` can move lifts. Replace
`.1036` can swap a movement. None of
those add a movement they forgot.
Backfill `.1000` is a new row. Add set
is on an existing lift.

**Ship:** add a lift to this finished
session. `decideAppendFinishedExercise`
empty on missing draft / not an array /
empty next id. Noop on unknown lift
(same known-lift check as replace).
Apply appends `{ exerciseId, sets: [{
reps: 0, weight: 0 }] }` — same empty
set as `appendDraftSet`. Existing lifts
unchanged (cloned). Duplicate lift ids
allowed. Does not invent loads. Does
not write Wednesday / saved / live
Start. History edit: `ExercisePicker`
at the bottom (same component as
backfill / replace). Apply to local
draft only. Save still confirm-gated
`decideEditSave`. Empty 0/0 still needs
evidence. Same finished log. Same id.
Guest. First set ungated. Today still
one Start. Resume `.963` kept. Replace
`.1036` / Duration `.1035` / Reorder
`.1034` / Edit `.997` / Backfill `.1000`
stay. `/private` stays the tight lock.
No `PRIVATE_MODE` flip.

Label `2026.07-unified.1037` (from
master `.1036` / `3408cbfef`). Stamp
stays `.1037`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1022-for-1037.md](LOG-rotate-1022-for-1037.md).
