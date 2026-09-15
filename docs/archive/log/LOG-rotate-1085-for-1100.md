Superseded live LOG section rotated 2026-09-15 for `.1100` storage.remove CapResult consistency.

## 2026-09-15 — CapResult unknown-method consistency (`.1085`)

Calling a method that is not in
the closed set for a declared
door returns the same CapResult
deny shape as the other denials:
`{ ok: false, code:
'unknown_method' }` — not a
throw, not `undefined`, not
`scope_denied`. Scope gate
first: when the door is not
declared, `identity.foo` /
`billing.cancel` /
`photos.delete` /
`storage.clear` stay
`scope_denied`. Known methods
keep `.1079`–`.1084`. Closed
sets stay identity `read`,
billing `read` / `checkout` /
`portal`, photos `read` /
`write`, storage `get` / `set`.
`callDoor` is the string
dispatch. No UI. No Stripe.
No camera. Isolation: coach /
store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** declared
unknown returning
`scope_denied` or throwing;
undeclared unknown returning
`unknown_method`; `storage.clear`
wiping the map; known methods
flipping codes; result
`undefined`.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1085`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1070-for-1085.md](docs/archive/log/LOG-rotate-1070-for-1085.md) (`.1070`).
