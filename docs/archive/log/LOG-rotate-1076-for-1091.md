Superseded live LOG section rotated 2026-09-15 for `.1091` deeplink bad_deeplink.

## 2026-09-15 — Mission OS mini mount isolation tests (`.1076`)

Health `l1.health` (not retired
`health.mini`) and ClearShot
`utility.clearshot` isolation
on MiniHost bus fakes. Health:
identity + storage granted;
photos / billing `scope_denied`
(not `photos_stub`). ClearShot:
photos + `storage.write`
granted (photos stay
`photos_stub`); billing
`scope_denied`. CapResult
sandbox: one mini cannot read
the other's storage keyspace
(probe remount with
`storage.read` sees its own
value only). Stubs stay stubby
— no Stripe, camera, or
Android Photos / Billing
wiring. No Health / ClearShot
UI. No tip-promote. Isolation:
coach / store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** shared
store last-write-wins
(`health-only` becomes
`shot-only`); Health photos
deny code is `scope_denied`
not `photos_stub`; retired
`health.mini` cannot mount
against `mission://minis/health`;
ClearShot billing is
`scope_denied` not
`photos_stub`.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1076`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1059-for-1076.md](docs/archive/log/LOG-rotate-1059-for-1076.md) (`.1059`).
