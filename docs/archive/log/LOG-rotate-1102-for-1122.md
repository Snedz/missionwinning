## 2026-09-15 — Identity remount after inject (`.1102`)

`injectIdentitySnapshot` on a
live Health fake is
per-instance. Unmount + remount
binds the host snapshot again.
Leftover inject dies —
remounted `identity.read` is
the host-bound envelope, not
the override. Inject on the old
fake after remount does not
change remounted.read. B.read
stays. After `storage_cap` +
inject + remount, identity is
still host-bound. ClearShot
remount after inject rebinds
its host snapshot.
`test.noidentity` remount stays
`scope_denied`. `.1093` closed
live dual-mount isolation.
`.1099` closed leftover
storage occupancy. Isolation:
coach / store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** remount
returning leftover inject or
throwing; remount rewriting
B.read; old-fake inject after
remount leaking; cap+inject
leftover surviving remount;
ClearShot leftover inject
surviving; noidentity remount
gaining a snapshot; HOP.md
carrying the claim.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1102`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1087-for-1102.md](docs/archive/log/LOG-rotate-1087-for-1102.md) (`.1087`).
