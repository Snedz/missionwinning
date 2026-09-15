Superseded live LOG section rotated 2026-09-15 for `.1096` CapResult unknown_capability.

## 2026-09-15 — MiniHost.listMounted CapResult inventory (`.1081`)

`MiniHost.listMounted` is the
in-memory CapResult inventory:
mounted mini ids plus each
mini's declared scopes only.
Peeking a scope the mini did
not declare is `scope_denied`.
Peeking a never-mounted id is
`unknown_mini` — not a silent
empty row. Empty host lists
`[]`. Unmount drops that id.
Remount without unmount stays
one row. A failed mount is not
listed. Stubs stay stubby. No
UI / Stripe / camera. Isolation:
coach / store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** Health
inventory lists `billing.read`
or photos; never-mounted peek
returns `scope_denied`;
undeclared peek returns
`unknown_mini`; empty host
returns `unknown_mini`; unmount
leaves the id listed; remount
duplicates the row; failed
mount is listed; returned
scopes mutate the host.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1081`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1066-for-1081.md](docs/archive/log/LOG-rotate-1066-for-1081.md) (`.1066`).
