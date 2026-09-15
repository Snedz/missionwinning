# Paper .1085 — CapResult unknown-method consistency

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

## Goal

Close the last CapResult hole on the fake bus: a method name that is
not in the closed set must still return a typed deny. Same shape as
`scope_denied`. Does not throw. Does not return `undefined`.

## Claim

Calling a method that is **not** in the closed method set for a
**declared** door returns CapResult `{ ok: false, code: 'unknown_method' }`.
Scope gate runs first: when the door is not declared, the same unknown
name is `scope_denied` (deny-before-unknown). Known methods keep the
`.1079`–`.1084` envelopes.

Closed methods (unchanged):

- identity: `read`
- billing: `read`, `checkout`, `portal`
- photos: `read`, `write`
- storage: `get`, `set`

## Accept

1. For each door that a mini declares, an unknown method name
   (`identity.foo`, `billing.cancel`, `photos.delete`, `storage.clear`)
   returns `{ ok: false, code: 'unknown_method' }`.
2. When the door is **not** declared, those unknown names still return
   `scope_denied` (deny-before-unknown — scope gate first).
3. Known methods keep existing envelopes (deny or allow) from
   `.1079`–`.1084`.
4. Unit tests only under `src/lib/mission-os/`; judge ≠ builder —
   expected codes hardcoded in tests.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No rewriting deny codes for known methods. No new product mini.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
