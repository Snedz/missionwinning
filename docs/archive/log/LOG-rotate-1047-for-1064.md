# Rotated from LOG.md for `.1064`

## 2026-08-26 — Superset on a finished session (`.1047`)

Live already has optional
exercise groups (`superset.ts` /
`supersetGroup` /
`stripOrphanGroups` / "Superset
w/ next", `.980`). History edit
cannot pair or unpair lifts on a
finished log. Same finished log.
Same id.

**Ship:** Optional exercise group
on a finished History session.
`decidePatchFinishedSuperset`
empty on missing draft / junk
indexes / one-lift session. Last
lift + pair-with-next is empty.
`pair` true / `'next'` shares a
group id with the next (reuse
existing group on either side;
else mint a short id). Same group
already is noop. `pair` false /
`''` / blank clears this lift
then `stripOrphanGroups` — an
orphan is not a group. Already
unpaired is noop. Apply clones
exercises. Does not rewrite sets
/ notes / duration / name.
`draftsEqual` includes
`supersetGroup` (trimmed /
omitted equal). `stripDraft`
omits an undefined group and
runs `stripOrphanGroups`. History
edit: outline 44px control per
lift when 2+. testid
`session-history-superset-{exIdx}`.
Pair with next when a next lift
exists; unpair when grouped.
Draft only. Save still
confirm-gated `decideEditSave`.
Not a new SetKind. Not
marketplace circuits. Does not
smash live `.980`. Guest. First
set ungated. Today still one
Start. Resume `.963` kept.
Session note `.1046` / lift note
`.1045` stay. `/private` stays
the tight lock. No `PRIVATE_MODE`
flip.

Label `2026.07-unified.1047` (from
master `.1046` / `89437956d`). Stamp
stays `.1047`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1032-for-1047.md](docs/archive/log/LOG-rotate-1032-for-1047.md).
