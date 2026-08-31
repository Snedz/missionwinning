# Rotated from LOG.md for `.1063`

## 2026-08-26 — Session note on a finished session (`.1046`)

Live already has optional private
session notes (`normalizeSessionNote`
/ `attachSessionNote` /
`SESSION_NOTE_MAX` 500, `.983`).
History detail has Name `.1007` and
Duration `.1035` and does not show
or edit `sessionNote`. Same finished
log. Same id.

**Ship:** Optional private session
note on a finished History session.
`decidePatchFinishedSessionNote`
empty on empty id / non-string junk.
Blank / null / undefined clears
(field omitted) unless already
omitted (noop). Live-open / missing
/ tomb is noop. Same normalized text
is noop. Over-cap truncates at 500
(never emptied). Apply maps history
via `attachSessionNote` and bumps
`revision` / `updatedAt`. Does not
rewrite sets / duration / name /
lift notes. Does not smash
`decideEditSave` or the live jot.
History detail: 44px textarea next
to Duration. testid
`session-history-session-note`. Own
outline Save
`session-history-session-note-save`.
Hide on tomb. Guest. First set
ungated. Today still one Start.
Resume `.963` kept. Lift note `.1045`
/ Duration `.1035` / Name `.1007`
stay. `/private` stays the tight
lock. No `PRIVATE_MODE` flip.

Label `2026.07-unified.1046` (from
master `.1045` / `a67650a61`). Stamp
stays `.1046`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1031-for-1046.md](docs/archive/log/LOG-rotate-1031-for-1046.md).
