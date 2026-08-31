# Rotated from LOG.md for `.1065`

## 2026-08-26 — Open empty load is blank, not 0 (`.1048`)

Live `SetLogTable` bound
`value={input.weight}` so a
reps-only / empty-load cell painted
**0**. History edit already uses
empty string when weight is 0
(`.997`). Completed kg cell already
BW for weight/vest (`.1025`). Store
stays `0`. Display only.

**Ship:** Open empty load is blank,
not 0. `formatOpenLoadInput(weight)`
→ `''` when weight is 0 / missing /
non-finite; otherwise the typed
number string.
`parseOpenLoadInput(raw)` blank /
junk → `0` (store stays 0). Never
clamp into a load they did not type
beyond existing min/max if already
in the table. `SetLogTable` open
weight/assist cell is
`SetRowLoadField`: local draft like
the time cell so `0.` / `2.5` stay
typeable; unfocused empty is still
blank. Binding format to `value`
round-trips `0.` to blank. Plus-load
`BW+` prefix stays; the number
beside it is blank when added-load
is 0. LogConsole
leftover plus-load uses the same
helper. Do not remount dead
LogConsole. Never write BW / a
bodyweight kilogram into the store.
Do not rewrite History
`calculateVolume`. Assisted-0
**completed** mute stays later.
History edit empty string stays.
Completed `.1025` BW stays. Guest.
First set ungated. Today still one
Start. Resume `.963` kept. `/private`
stays the tight lock. No
`PRIVATE_MODE` flip.

Label `2026.07-unified.1048` (from
master `.1047` / `48958422c`). Stamp
stays `.1048`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1033-for-1048.md](docs/archive/log/LOG-rotate-1033-for-1048.md).
