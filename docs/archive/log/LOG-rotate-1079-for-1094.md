Superseded live LOG section rotated 2026-09-15 for `.1094` dual-mount billing isolation.

## 2026-09-15 — Billing CapResult deny consistency (`.1079`)

When a mini lacks billing
scope (`utility.clearshot`,
`l1.health`), every billing
method on the fake bus
(`read`, `checkout`, `portal`)
returns the same `CapResult`
deny: `{ ok: false, code:
'scope_denied' }` — not
`photos_stub`, not `stub`, not
a throw. A test-only
`test.billing` probe (not a
product mount, not in the
deeplink table or
`MINI_REGISTRY`) is granted
`billing.read` and gets a stub
success path without Stripe:
muted recognition on `read`,
`{ held: true }` on checkout /
portal. Gate stays
`billing.read`. No Stripe
keys. No product UI. Isolation:
coach / store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** a fourth
billing method on the fake;
ClearShot / Health checkout
returning `photos_stub` or
`ok: true`; granted probe
missing from the closed
method set; `test.billing`
resolving on the deeplink
table or `MINI_REGISTRY`.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1079`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1064-for-1079.md](docs/archive/log/LOG-rotate-1064-for-1079.md) (`.1064`).
