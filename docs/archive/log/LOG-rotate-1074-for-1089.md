Superseded live LOG section rotated 2026-09-15 for `.1089` CapResult call not_mounted.

## 2026-09-14 — Health mini slug `l1.health` (`.1074`)

`health.mini` forced last-segment
slug `mini`, so the deep link
was the opaque `mission://minis/mini`.
Renamed to `l1.health` —
`MODULE_ID` needs two segments
(single-segment `health` fails
`parseModuleId`) and the last
segment is `health`, so entry is
`mission://minis/health`.
`assertModuleManifest` accepts.
Identity + storage scopes stay
the closed set. Photos / billing
/ `health.write` still deny.
Not `health.train`. No Health UI.
No tip-promote. Isolation: coach /
store / HomePage / ActiveWorkout
stay blind.

**Mutants killed:** leftover
`mission://minis/mini` dies on
the new id; single-segment
`health` is `invalid module id`;
`health.mini` + `mission://minis/health`
fails last-segment match.

CI `offline.spec` @gate leftover:
hard `goto('/active')` while
offline is not client nav —
stay on leftover Log set
(widened to `Log` / `Log set`).
Compose-bar Today while offline
serves `/offline` (measured).
Same class as `.1070` Hero.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1074`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1057-for-1074.md](LOG-rotate-1057-for-1074.md) (`.1057`).
