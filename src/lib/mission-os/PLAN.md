# Paper .1081 — MiniHost.listMounted CapResult inventory

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo.

## Claim

`MiniHost.listMounted` is a CapResult inventory of the in-memory host:
mounted mini ids plus each mini's **declared scopes only**. Peeking a
scope the mini did not declare is `scope_denied`. Peeking a
never-mounted id is `unknown_mini` — not a silent empty row.

## Accept

1. Empty host: `listMounted()` is `{ ok: true, value: [] }`.
2. After Health + ClearShot mount, the inventory lists `l1.health` and
   `utility.clearshot` with only their declared scopes (Health has no
   photos/billing; ClearShot has no `billing.read` / `storage.read`).
3. `listMounted(id)` of a mounted mini returns that id + declared
   scopes. A never-mounted id is `{ ok: false, code: 'unknown_mini' }`.
4. `listMounted(id, scope)` of a declared scope is ok. An undeclared
   scope on a mounted mini is `{ ok: false, code: 'scope_denied' }`.
   A never-mounted id + any scope is `unknown_mini` (id first).
5. Unmount drops that id from the inventory. Remount without unmount
   stays one row. A failed mount (`stub`) is not listed.
6. Stubs stay stubby: no Stripe, camera, or Android Photos / Billing.

Judge ≠ builder: expected ids, scopes, and deny codes are hardcoded in
the test, not read back from production constants.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No `PRIVATE_MODE` flip. No tip-promote. Live www stays `.697`.
ClearShot Android cash stays Next ONE.
