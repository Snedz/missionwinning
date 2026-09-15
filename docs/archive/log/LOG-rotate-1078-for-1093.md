Superseded live LOG section rotated 2026-09-15 for `.1093` dual-mount identity isolation.

## 2026-09-15 — MiniHost unmount/remount isolation (`.1078`)

In-memory `MiniHost.unmount(id)`
tears down that mini's fake
storage keyspace. After unmount,
a remount cannot read leftovers
from another mini or from its
previous mount. Remount without
unmount still keeps the same
mini's keys (`.1076`). Second
unmount and never-mounted id
are `unknown_mini`. Stubs stay
stubby. No Photos / Billing /
Android. No ClearShot UI.
Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** unmount is
a no-op (remount sees
`health-only`); unmount clears
every store (ClearShot
`shot-only` vanishes); second
unmount returns ok; never-
mounted unmount returns ok;
torn-down handle still reads
the leftover map.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1078`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1062-for-1078.md](docs/archive/log/LOG-rotate-1062-for-1078.md) (`.1062`).
