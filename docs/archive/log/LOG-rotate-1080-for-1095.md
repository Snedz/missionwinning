Superseded live LOG section rotated 2026-09-15 for `.1095` dual-mount photos isolation.

## 2026-09-15 — Photos CapResult deny consistency (`.1080`)

When a mini lacks photos
scope (`l1.health`), every
photos method on the fake bus
(`read`, `write`) returns the
same `CapResult` deny:
`{ ok: false, code:
'scope_denied' }` — not
`photos_stub`, not `stub`, not
a throw. `utility.clearshot`,
which declares photos, stays
`photos_stub` on every method
(existing) — not `ok: true`,
not a camera. No MediaStore.
No Android wiring. No product
UI. Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** a third
photos method on the fake;
Health `read` / `write`
returning `photos_stub` or
`ok: true`; ClearShot returning
`scope_denied` or `ok: true`;
camera / MediaStore import on
the fake files.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1080`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1065-for-1080.md](docs/archive/log/LOG-rotate-1065-for-1080.md) (`.1065`).
