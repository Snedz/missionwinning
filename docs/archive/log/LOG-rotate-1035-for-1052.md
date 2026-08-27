# Archived from LOG.md for `.1052` (Revert Patreon costume, restore wireframe)

Rotated 2026-08-27. Whole `##` section, order preserved.

## 2026-08-26 — Edit this session's logged duration (`.1035`)

History already **prints**
`log.durationSeconds`
(`formatDuration`). Set-hold duration
is already editable in History edit.
The **session clock they logged** is
not.

**Ship:** edit this finished session's
logged duration.
`decideEditSessionDuration` parses
seconds or mm:ss via
`parseDurationSeconds`. Cap 86400.
Empty / junk / negative / over-cap
invents nothing. Missing / tomb /
live-open / same value is noop. `0`
clears the clock (the list already
hides 0). Apply keeps same id, same
sets, same startedAt/completedAt.
Never invents elapsed from
`startedAt`. History detail: outline
44px **Save duration**. Guest. First
set ungated. Today still one Start.
Resume `.963` kept. Reorder `.1034` /
Name `.1007` / Edit `.997` / Move
`.1027` / Copy `.1030` stay. Live
pause `.1001` stays on Train.
`/private` stays the tight lock. No
`PRIVATE_MODE` flip.

Label `2026.07-unified.1035` (from
master `.1034` / `a075f994f`). Stamp
stays `.1035`. Live www stays `.696`.

Rotated LOG oldest → [LOG-rotate-1020-for-1035.md](LOG-rotate-1020-for-1035.md).
