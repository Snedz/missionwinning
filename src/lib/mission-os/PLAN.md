# Paper .1083 — Storage CapResult deny consistency

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo.

## Claim

When a mini lacks `storage.write` (test-only mini without storage),
every storage method on the fake bus (`get` / `set`) returns the same
CapResult deny (`scope_denied`). Product minis with storage keep stub
success: `l1.health` (read + write) and `utility.clearshot` (write;
read stays `scope_denied` because ClearShot does not declare
`storage.read`). No product mini lacks storage — test-only
`test.nostorage` is the deny fixture.

## Accept

1. Closed storage methods are `get` and `set`. A third method is a new PR.
2. `test.nostorage` (not a product mount): every storage method is
   `{ ok: false, code: 'scope_denied' }` — not `photos_stub`, not
   `stub`, not a throw. Deny does not write the map.
3. `test.billing` (already unscoped for storage) returns the same deny
   — the code is not hardcoded to one id.
4. `l1.health`: `get` and `set` are stub success (in-memory map).
5. `utility.clearshot`: `set` is stub success; `get` stays
   `scope_denied` (no `storage.read`).
6. `test.nostorage` is unknown to the deeplink table and
   `MINI_REGISTRY`.
7. Stubs stay stubby: no `safeStorage`, no raw `localStorage`, no
   Stripe, no camera, no Android.

Judge ≠ builder: expected snapshots and deny codes are hardcoded in
the test, not read back from production constants.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No `PRIVATE_MODE` flip. No tip-promote. Live www stays `.697`.
ClearShot Android cash stays Next ONE.
