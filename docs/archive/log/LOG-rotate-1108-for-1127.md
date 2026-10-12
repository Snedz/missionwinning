## 2026-09-16 — Storage remount leftover old-fake writes (`.1108`)

`storage.set` / `remove` on a
live fake is per-instance.
Unmount + remount binds a new
store. Leftover writes on the
old fake die — remounted `get`
is miss, not the leftover set.
Set or remove on the old fake
after remount does not write
remounted occupancy. Sibling
storage stays. After
`storage_cap` + remount,
old-fake set does not re-cap
remounted. ClearShot remount:
old-fake set does not occupy
remounted (`get` stays
`scope_denied`). `test.nostorage`
/ `test.billing` remount stay
`scope_denied`. `.1092` closed
live dual-mount isolation.
`.1099` closed remount-after-cap
emptiness. `.1102` / `.1103` /
`.1107` closed snapshot remount.
Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** remount
returning leftover set or
throwing; old-fake set after
remount writing remounted;
old-fake remove deleting
remounted keys; remount
rewriting sibling storage;
cap leftover occupying
remounted; ClearShot leftover
set filling remounted;
unscoped remount gaining write;
HOP.md carrying the claim.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1108`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1093-for-1108.md](docs/archive/log/LOG-rotate-1093-for-1108.md) (`.1093`).
