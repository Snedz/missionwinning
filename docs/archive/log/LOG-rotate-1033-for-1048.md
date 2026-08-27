# Rotated from LOG.md for `.1048` (Open empty load is blank, not 0)

## 2026-08-26 — This month shows how many live sessions (`.1033`)

The History calendar footer already
prints training days. Two logs on
Tuesday is still one training day.
The live session count for the month
on screen was missing.

**Ship:** the month on screen prints
how many live sessions.
`decideMonthSessionCount` is empty on
junk / no live rows. Two live sessions
on one day apply 2, not 1 training
day. Tombs stay out. `startFrom` does
not shrink. Never invents 0 as apply.
testid `history-month-sessions`.
Training-days summary stays. Empty
month stays “Nothing logged this
month.” — not 0 sessions. Not a fire.
Not a streak. Not a year picker.
Day-cell `.1032` stays. Never
`toISOString()` for a calendar date.
Guest. First set ungated. Today still
one Start. Resume `.963` kept. This
month `.1031` / Copy `.1030` / month
file `.1029` / empty-day `.1028` /
Move `.1027` / Repeat `.1026` stay.
`/private` stays the tight lock. No
`PRIVATE_MODE` flip.

Label `2026.07-unified.1033` (from
master `.1032` / `56b7e3eab`). Stamp
stays `.1033`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1018-for-1033.md](docs/archive/log/LOG-rotate-1018-for-1033.md).
