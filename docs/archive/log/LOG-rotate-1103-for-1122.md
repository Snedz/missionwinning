## 2026-09-15 — Billing remount after inject (`.1103`)

`injectBillingSnapshot` on a
live `test.billing` fake is
per-instance. Unmount + remount
binds the host muted snapshot
again. Leftover inject dies —
remounted `billing.read` is the
host-bound envelope, not the
override. Inject on the old
fake after remount does not
change remounted.read. B.read
stays. After `storage_cap` +
inject + remount, billing is
still host-bound. ClearShot
remount after inject rebinds
its host billing snapshot
(leftover inject dies; billing
stays `scope_denied`). Health
remount stays `scope_denied`.
`.1094` closed live dual-mount
isolation. `.1099` closed
leftover storage occupancy.
`.1102` closed identity remount.
Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** remount
returning leftover inject or
throwing; remount rewriting
B.read; old-fake inject after
remount leaking; cap+inject
leftover surviving remount;
ClearShot leftover inject
granting billing; Health remount
gaining a billing snapshot;
HOP.md carrying the claim.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1103`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1088-for-1103.md](docs/archive/log/LOG-rotate-1088-for-1103.md) (`.1088`).
