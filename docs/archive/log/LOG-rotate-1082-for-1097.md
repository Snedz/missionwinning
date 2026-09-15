Superseded live LOG section rotated 2026-09-15 for `.1097` CapResult storage_cap.

## 2026-09-15 — Identity CapResult deny consistency (`.1082`)

When a mini lacks identity
scope, every identity method
on the fake bus (`read`)
returns the same `CapResult`
deny: `{ ok: false, code:
'scope_denied' }` — not
`photos_stub`, not `stub`, not
a throw. Product minis
`l1.health` and
`utility.clearshot` declare
`identity.read` and keep stub
success (guest `null` / `null`,
or the injected snapshot).
Nothing is minted. No product
mini lacks identity — test-only
`test.noidentity` (not a
product mount, not in the
deeplink table or
`MINI_REGISTRY`) is the deny
fixture. `test.billing` (also
unscoped for identity) returns
the same deny. No auth UI. No
Supabase. Isolation: coach /
store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** a second
identity method on the fake;
Health / ClearShot `read`
returning `scope_denied` or
`photos_stub`; `test.noidentity`
returning `ok: true`; deny
hardcoded to one id
(`test.billing` would pass);
`test.noidentity` resolving on
the deeplink table or
`MINI_REGISTRY`; injected
snapshot leaking onto the
unscoped probe.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1082`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1067-for-1082.md](LOG-rotate-1067-for-1082.md) (`.1067`).
