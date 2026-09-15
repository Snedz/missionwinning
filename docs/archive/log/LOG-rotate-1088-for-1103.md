Superseded live LOG section rotated 2026-09-15 for `.1103` billing remount after inject.

## 2026-09-15 — MiniHost.unmount not_mounted (`.1088`)

`MiniHost.unmount(id)` when the
id is not currently mounted
returns the same CapResult deny
shape as the other host errors:
`{ ok: false, code:
'not_mounted' }` — not a throw,
not `unknown_mini` (that code
stays mount / peek), not a
silent ok. Live unmount still
succeeds and clears that mini's
fake keyspace (`.1078`).
Double-unmount is `not_mounted`.
`unknown_mini` (`.1087`) and
`already_mounted` (`.1086`) stay
unchanged. No UI. No Stripe.
No camera. Isolation: coach /
store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** never-mounted
unmount returning `ok` or
throwing; never-mounted unmount
reusing `unknown_mini`; second
unmount returning `ok`; live
unmount leftovers surviving;
`listMounted` staying populated
after a successful unmount.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1088`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1073-for-1088.md](docs/archive/log/LOG-rotate-1073-for-1088.md) (`.1073`).
