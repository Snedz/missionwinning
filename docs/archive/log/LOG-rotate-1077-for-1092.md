Superseded live LOG section rotated 2026-09-15 for `.1092` dual-mount storage isolation.

## 2026-09-15 — ClearShot mini deeplink last-segment (`.1077`)

Last-segment `clearshot` is the
ClearShot entry, so the deep
link is `mission://minis/clearshot`
— not a long opaque path
(`mission://minis/utility.clearshot`).
`mountMiniByDeeplink` on existing
MiniHost + bus fakes resolves that
route to the reserved
`utility.clearshot` mount, mirroring
Health last-segment `health` →
`mission://minis/health` →
`l1.health`. Closed table:
`health` + `clearshot`. Long /
opaque slugs and prototype keys
(`toString`) stay `unknown_mini`.
Stubs stay stubby. No Photos /
Billing / Android. No ClearShot UI.
Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** long opaque
`utility.clearshot` /
`utilityclearshot` last-segment
mounts ClearShot; last-segment
`clearshot` mounts `l1.health`;
`Object` proto keys (`toString`)
resolve; `/minis/clearshot` path
is treated as a mission:// route.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1077`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1061-for-1077.md](docs/archive/log/LOG-rotate-1061-for-1077.md) (`.1061`).
