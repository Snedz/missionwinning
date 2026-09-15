Superseded live LOG section rotated 2026-09-15 for `.1098` CapResult deny-code set freeze.

## 2026-09-15 — Storage CapResult deny consistency (`.1083`)

When a mini lacks storage
(`test.nostorage`, also
`test.billing`), every storage
method on the fake bus
(`get`, `set`) returns the
same `CapResult` deny:
`{ ok: false, code:
'scope_denied' }` — not
`photos_stub`, not `stub`, not
a throw. Deny does not write
the map. `l1.health` (read +
write) keeps stub success.
`utility.clearshot` `set`
succeeds; `get` stays
`scope_denied` (no
`storage.read`). No durable
browser write. No Stripe. No
camera. No Android. Isolation:
coach / store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** a third
storage method on the fake;
`test.nostorage` returning
`ok: true`; Health / ClearShot
write denied; deny hardcoded
to one id (`test.billing`
would pass); probe listed on
deeplink / registry; deny
still writes the map.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1083`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1068-for-1083.md](docs/archive/log/LOG-rotate-1068-for-1083.md) (`.1068`).
