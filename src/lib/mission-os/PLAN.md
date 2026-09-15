# Paper .1079 — Billing CapResult deny consistency

ONE hop. Stubs stay stubby — no Stripe keys, no product UI, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays.
No `mission-ops/` in this public repo.

## Claim

When a mini lacks billing scope (`utility.clearshot` and `l1.health` as
designed), every billing method on the fake bus returns the same
`CapResult` deny (`scope_denied`). A test-only mini granted `billing.read`
gets a stub success path without Stripe.

## Accept

1. Closed billing methods on the named fake: `read`, `checkout`, `portal`.
   A fourth name is a fail.
2. ClearShot and Health: every method returns `{ ok: false, code: 'scope_denied' }`
   — not `photos_stub`, not `stub`, not a throw.
3. `test.billing` (test-only, not a product mount, not in the deeplink
   table or `MINI_REGISTRY`) gets stub success: `read` is muted
   recognition; `checkout` / `portal` are `{ held: true }`.
4. No Stripe import, no checkout session, no billing portal URL, no
   product UI.

Judge ≠ builder: deny codes and the granted hold value are hardcoded in
the test, not read back from production constants.

## Non-goals

No product UI. No Today / Train door. No Stripe. No `PRIVATE_MODE` flip.
No tip-promote. Live www stays `.697`. ClearShot Android cash stays Next ONE.
