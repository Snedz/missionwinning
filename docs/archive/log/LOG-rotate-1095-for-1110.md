Superseded live LOG section rotated 2026-09-17 for `.1110` honest manifest description under PRIVATE_MODE.

## 2026-09-15 — Dual-mount CapResult photos isolation (`.1095`)

Two different minis mounted at
once with photos scope each
see only their own stub
snapshot via CapResult
`photos.read`. `A.read` is
A's envelope, not B's.
Injecting or mutating A's
snapshot does not change
`B.read`. Write on a granted
door with a bound snapshot is
the same isolated stub
envelope. Without photos
scope, every photos method
stays `scope_denied` (`.1080`)
even when a snapshot is
injected for that id. Health
stays denied. ClearShot with
no bound snapshot stays
`photos_stub`. Storage
isolation (`.1092`), identity
isolation (`.1093`), and
billing isolation (`.1094`)
stay. Fake-only `photoses[id]`
+ `injectPhotosSnapshot` —
no camera. No MediaStore. No
UI. Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** shared
host-wide photos snapshot
(`shot` becomes `granted`);
inject A rewriting B.read;
mutating the injected
ClearShot object leaking
into granted; unscoped Health
returning the injected
snapshot instead of
`scope_denied`; identity,
billing, or storage maps
collapsing while both live.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1095`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1080-for-1095.md](docs/archive/log/LOG-rotate-1080-for-1095.md) (`.1080`).
