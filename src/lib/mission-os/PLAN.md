# Paper .1076 — Mission OS mini mount isolation

ONE hop. Tests only. Stubs stay stubby — no real Photos / Billing wiring.
ClearShot Android cash stays Next ONE. No tip-promote. `PRIVATE_MODE` stays.

## Claim

`MiniHost` + in-memory bus fakes isolate Health (`l1.health`, not retired
`health.mini`) and ClearShot (`utility.clearshot`) by `CapResult`: granted
doors work as designed; denied doors are `scope_denied` (or scoped
`photos_stub`); one mini cannot read the other's storage keyspace.

## Test matrix

| Mount | identity | storage.write | storage.read | photos | billing |
|-------|----------|---------------|--------------|--------|---------|
| `l1.health` / `mountHealthMini` | granted | granted | granted | `scope_denied` (not `photos_stub`) | `scope_denied` |
| `health.mini` (retired slug) | not the live mount — last-segment `mini` is gone | — | — | — | — |
| `utility.clearshot` / `mountClearShotMini` | granted | granted | `scope_denied` (by design) | `photos_stub` (scoped; not a camera) | `scope_denied` |

## Isolation (same host, two mounts)

1. Health writes `secret=health-only`. ClearShot writes `secret=shot-only`.
2. Health.get(`secret`) is `health-only`.
3. ClearShot.get(`secret`) is `scope_denied` (no `storage.read` on the reserved row).
4. Probe remount of the ClearShot id **plus** `storage.read` (test-only; production
   scopes stay closed) sees `shot-only`, never `health-only`.
5. Health still sees `health-only` after the probe.

Judge ≠ builder: expected grant/deny codes are hardcoded in the test, not read
back from production scope constants.

## Non-goals

No Health / ClearShot UI. No Android `:minis:clearshot`. No Today / Train door.
No Stripe. No `PRIVATE_MODE` flip. No tip-promote. Live www stays `.697`.
