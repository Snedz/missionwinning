## 2026-09-16 — Photos remount after inject (`.1107`)

`injectPhotosSnapshot` on a
live photos-scoped fake is
per-instance. Unmount + remount
binds the host stub snapshot
again. Leftover inject dies —
remounted `photos.read` is the
host-bound envelope, not the
override. Inject on the old
fake after remount does not
change remounted.read. Sibling
read stays. After `storage_cap`
+ inject + remount, photos is
still host-bound. ClearShot
remount after inject rebinds
its host photos snapshot
(leftover inject dies; no host
row stays `photos_stub`). Health
/ `test.billing` remount stay
`scope_denied`. `.1095` closed
live dual-mount isolation.
`.1103` closed billing remount.
Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** remount
returning leftover inject or
throwing; remount rewriting
sibling.read; old-fake inject
after remount leaking; cap+inject
leftover surviving remount;
ClearShot leftover inject
granting photos with no host
row; Health remount gaining a
photos snapshot; HOP.md carrying
the claim.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1107`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1092-for-1107.md](docs/archive/log/LOG-rotate-1092-for-1107.md) (`.1092`).
