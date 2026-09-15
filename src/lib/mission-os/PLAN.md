# Paper .1078 — MiniHost unmount/remount isolation

ONE hop. Stubs stay stubby — no real Photos / Billing / Android.
ClearShot Android cash stays Next ONE. No tip-promote.
`PRIVATE_MODE` stays. No `mission-ops/` in this public repo.

## Claim

After `MiniHost.unmount` (smallest in-memory teardown), a remounted mini
must not read prior storage keyspace leftovers from another mini or from
its own previous mount. `.1076` still holds: remount *without* unmount
keeps the same mini's keyspace.

## Accept

1. `MiniHost` exposes `unmount(id)` on the in-memory host/fakes only.
2. Health writes a key, `unmount('l1.health')`, remount → `get` is
   `undefined` (not the leftover value).
3. Unmounting Health does not wipe ClearShot keys (and the reverse).
4. A ClearShot probe with `storage.read` after Health unmount cannot
   read Health leftovers.
5. Unmount of a never-mounted id, and a second unmount of the same id,
   are `unknown_mini`.
6. Stubs stay stubby: no Stripe, camera, or Android Photos / Billing.

Judge ≠ builder: leftover values and deny codes are hardcoded in the
test, not read back from production constants.

## Non-goals

No product UI. No Today / Train door. No Photos / Billing / Android
wiring. No Stripe. No `PRIVATE_MODE` flip. No tip-promote. Live www
stays `.697`.
