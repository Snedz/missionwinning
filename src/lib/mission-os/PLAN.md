# Paper .1082 — Identity CapResult deny consistency

ONE hop. Stubs stay stubby — no auth UI, no Supabase, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo.

## Claim

When a mini lacks identity scope, every identity method on the fake
bus returns the same CapResult deny (`scope_denied`). Product minis
`l1.health` and `utility.clearshot` declare `identity.read` and keep
stub success. No product mini lacks identity — test-only
`test.noidentity` is the deny fixture.

## Accept

1. Closed identity methods are `read`. A second method is a new PR.
2. `test.noidentity` (not a product mount): every identity method is
   `{ ok: false, code: 'scope_denied' }` — not `photos_stub`, not
   `stub`, not a throw.
3. `l1.health` and `utility.clearshot`: every identity method is stub
   success (guest `null` / `null`, or the injected snapshot). Nothing
   is minted.
4. `test.billing` (already unscoped for identity) returns the same
   deny — the code is not hardcoded to one id.
5. `test.noidentity` is unknown to the deeplink table and
   `MINI_REGISTRY`.
6. Stubs stay stubby: no Supabase, no auth UI, no Stripe, no camera.

Judge ≠ builder: expected snapshots and deny codes are hardcoded in
the test, not read back from production constants.

## Non-goals

No product UI. No Today / Train door. No auth UI. No Supabase.
No `PRIVATE_MODE` flip. No tip-promote. Live www stays `.697`.
ClearShot Android cash stays Next ONE.
