Superseded live LOG section rotated 2026-09-15 for `.1099` remount after storage_cap.

## 2026-09-15 — CapResult allow-path consistency (`.1084`)

When a mini declares billing /
photos / identity / storage,
every granted method on that
door returns the same existing
stub-success envelope: identity
guest `null` / `null` (or the
injected snapshot), billing
muted read + `{ held: true }`,
photos `photos_stub` (not
`ok: true`), storage in-memory
`ok`. Test-only `test.granted`
(not a product mount, not in
the deeplink table or
`MINI_REGISTRY`) is the allow
fixture. Product minis keep the
stubs they already use. Deny
stays `.1079`–`.1083`. No UI.
No Stripe. No camera. Isolation:
coach / store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** extra method
on a fake; granted identity /
billing / storage returning
`scope_denied`; photos granted
flipping to `ok: true` or
`scope_denied`; `test.granted`
resolving on the deeplink table
or `MINI_REGISTRY`.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1084`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1069-for-1084.md](docs/archive/log/LOG-rotate-1069-for-1084.md) (`.1069`).
