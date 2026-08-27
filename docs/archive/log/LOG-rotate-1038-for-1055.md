# Archived from LOG.md for `.1055` (later-door object model + isolation holds)

Rotated 2026-08-27. Whole `##` section, order preserved.

## 2026-08-26 — Remove this lift from a finished session (`.1038`)

History edit `.997` can change sets.
Reorder `.1034` can move lifts. Replace
`.1036` can swap a movement. Add `.1037`
can append a lift. Remove-set drops one
row. None of those drop a whole
movement they added by mistake.
Session delete `.1003` is the whole log.

**Ship:** remove this lift from a
finished session. `decideRemoveFinishedExercise`
empty on missing draft / not an array /
junk index. Noop on out of range / only
one lift left. Apply splices that index
out. Other lifts unchanged (cloned).
Does not write Wednesday / saved / live
Start. Does not tomb the session.
History edit: outline 44px **Remove
lift** per lift when editing two or
more. Apply to local draft only. Save
still confirm-gated `decideEditSave`.
Same finished log. Same id. Guest.
First set ungated. Today still one
Start. Resume `.963` kept. Add `.1037`
/ Replace `.1036` / Duration `.1035` /
Reorder `.1034` / Edit `.997` /
Delete `.1003` stay. `/private` stays
the tight lock. No `PRIVATE_MODE` flip.

Label `2026.07-unified.1038` (from
master `.1037` / `b5cbfd21c`). Stamp
stays `.1038`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1023-for-1038.md](LOG-rotate-1023-for-1038.md).
