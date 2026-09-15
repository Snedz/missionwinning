# Paper .1084 — CapResult allow-path consistency

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo.

## Claim

When a mini **declares** billing / photos / identity / storage, every
granted method on that door returns the same existing stub-success
envelope. Deny stays `.1079`–`.1083`. This hop is the allow-path
mirror: one shape per door, not a second success code.

## Accept

1. Closed methods stay `identity.read`, billing `read` / `checkout` /
   `portal`, photos `read` / `write`, storage `get` / `set`.
2. Test-only `test.granted` (not a product mount) declares all four
   doors. Granted envelopes are hardcoded:
   - identity `read` → `{ ok: true, value: { missionId: null, callSign: null } }`
     (or the injected snapshot). Nothing is minted.
   - billing `read` → `{ ok: true, value: { bundle: 'none', muted: true } }`;
     `checkout` / `portal` → `{ ok: true, value: { held: true } }`.
   - photos `read` / `write` → `{ ok: false, code: 'photos_stub' }`
     (existing scoped stub — not `ok: true`, not `scope_denied`).
   - storage `get` / `set` → `{ ok: true, … }` on the in-memory map.
3. Product minis keep the same granted stubs they already use:
   `l1.health` (identity + storage), `utility.clearshot` (identity +
   photos_stub + storage.write), `test.billing` (billing).
4. `test.granted` is unknown to the deeplink table and `MINI_REGISTRY`.
5. Stubs stay stubby: no Stripe, camera, MediaStore, Supabase, or
   Android Photos / Billing.

Judge ≠ builder: expected envelopes are hardcoded in the test, not
read back from production constants.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No `PRIVATE_MODE` flip. No tip-promote. Live www stays `.697`.
ClearShot Android cash stays Next ONE.
No deny-shape rewrite. No photos `ok: true`.
