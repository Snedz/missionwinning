# Paper .1100 — storage.remove CapResult consistency

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

`.1083` closed get/set deny. `.1085` left `storage.clear` as
`unknown_method`. `.1098` / `.1099` named `storage.remove` as a
non-goal. This hop adds that one closed method.

## Goal

Close the missing-method hole on the storage door: `remove(key)` is
now a known method with the same CapResult consistency as get / set.
`ok` when scoped for write (deletes the key, or is a no-op miss).
`scope_denied` when unscoped (does not delete). `not_mounted` when
the id is not live. `storage.clear` / `storage.delete` stay
`unknown_method`. Distinct from remount-after-cap (`.1099`). Distinct
from the deny-code freeze (`.1098`). No ninth deny code.

## Claim

`storage.remove` is the third closed storage method. On MiniHost /
`call` / the fake:

- scoped write (`storage.write`): remove of a live key is
  `{ ok: true, value: undefined }`; a following get is a miss
  (Health / `test.granted`). ClearShot remove succeeds; get stays
  `scope_denied`. Occupancy drops — after a 32-key fill, the 33rd
  set is still `storage_cap`; remove one key; the next in-bound set
  is `ok`
- scoped write: remove of a missing key is the same `ok` envelope
  (idempotent). Does not throw
- unscoped (`test.nostorage`, `test.billing`): every storage method
  including `remove` is `{ ok: false, code: 'scope_denied' }` and
  does not delete a seeded key
- unmounted id: `host.call(id, 'storage', 'remove', { key })` is
  `{ ok: false, code: 'not_mounted' }` — does not throw, does not
  auto-mount
- `storage.clear` and `storage.delete` stay `unknown_method` on a
  declared door; undeclared door + those names stay `scope_denied`
  (deny-before-unknown, `.1085`)

Dual-mount isolation stays (`.1092`): A.remove(k) does not delete
B's k. Remount-after-cap stays (`.1099`). Host-lifecycle deny codes
stay the frozen eight (`.1098`) — no silent ninth code. No
`storage.clear` as a known method. No minis function-bus rewrite.

CapResult envelopes for known methods stay `.1079`–`.1099`
(`scope_denied` / `photos_stub` / stub success / `unknown_method` /
`unknown_capability` / `already_mounted` / `unknown_mini` /
`not_mounted` / `bad_deeplink` / `storage_cap` / storage miss /
identity / billing / photos isolation).

## Accept

1. Closed `STORAGE_METHODS` is exactly `get` / `set` / `remove`
   (hardcoded). Fake keys match. `storage.clear` / `storage.delete`
   stay `unknown_method` on a declared door.
2. Health / `test.granted`: set then remove is `ok`; get after is
   miss; remove of a missing key is `ok`. Fill 32; 33rd is
   `storage_cap`; remove one; next in-bound set is `ok`. Hardcoded
   envelopes.
3. Unscoped remove is `scope_denied` and does not delete a seeded
   key. Unmounted `host.call` remove is `not_mounted`. ClearShot
   remove is `ok`; get stays `scope_denied`. A.remove does not
   delete B's key. `host.call` matches the fake.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected codes hardcoded in tests, not read back from production
   as the source of truth.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No `storage.clear` /
`delete` as a known method. No new deny code. No raising the
storage cap. No remount-after-cap rewrite. No minis function-bus
`storageRemove`. No change to `.1079`–`.1099` envelopes.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
