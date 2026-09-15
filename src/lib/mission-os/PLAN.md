# Paper .1080 — Photos CapResult deny consistency

ONE hop. Stubs stay stubby — no camera, no MediaStore, no product UI,
no tip-promote. ClearShot Android cash stays Next ONE. `PRIVATE_MODE`
stays. No `mission-ops/` in this public repo.

## Claim

When a mini lacks photos scope (`l1.health` as designed), every photos
method on the fake bus returns the same `CapResult` deny
(`scope_denied`). `utility.clearshot`, which declares photos, stays
`photos_stub` on every method (existing).

## Accept

1. Closed photos methods on the named fake: `read`, `write`.
   A third name is a fail.
2. Health (`l1.health`): every method returns
   `{ ok: false, code: 'scope_denied' }` — not `photos_stub`, not
   `stub`, not a throw.
3. ClearShot (`utility.clearshot`): every method returns
   `{ ok: false, code: 'photos_stub' }` — not `ok: true`, not a camera.
4. No camera import, no MediaStore, no Android wiring, no product UI.

Judge ≠ builder: deny codes and the scoped stub code are hardcoded in
the test, not read back from production constants.

## Non-goals

No product UI. No Today / Train door. No camera. No MediaStore.
No `PRIVATE_MODE` flip. No tip-promote. Live www stays `.697`.
ClearShot Android cash stays Next ONE.
