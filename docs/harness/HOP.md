# Live hop

ticket: paper .1079 billing CapResult deny consistency
done_means: Unscoped minis (utility.clearshot, l1.health) get the same CapResult deny on every billing method; a test-only billing-granted mini gets a stub success path without Stripe.
accept: `npx tsx --test src/lib/mission-os/billing.test.ts src/lib/mission-os/fakes.test.ts src/lib/mission-os/host.test.ts`

## progress

Claim written. Tests + fakes + test-only `test.billing` probe landed. Docs/LOG/CONTEXT stamped `.1079`.

## decisions

- Closed billing methods on the named fake: `read`, `checkout`, `portal`. All return `CapResult`. Gate is still `billing.read` — no new product scope.
- Deny shape is hardcoded `{ ok: false, code: 'scope_denied' }` (not `photos_stub`, not `stub`).
- Granted path is `test.billing` — test-only, not in the deeplink table or `MINI_REGISTRY`. `read` returns muted recognition; `checkout` / `portal` return `{ held: true }` with no Stripe.
- ClearShot Android cash stays Next ONE. No tip-promote. PRIVATE_MODE stays.
