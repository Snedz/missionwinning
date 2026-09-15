# Paper .1098 — CapResult deny-code set freeze

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

`storage_cap` (`.1097`) closed the last named host-lifecycle deny.
This hop freezes the set so a ninth code cannot land silently.

## Goal

Close the silent-new-code hole `.1079`–`.1097` left implicit: the
CapResult host-lifecycle deny set is now a closed list. A new code
is a PLAN hop, not a string someone typed in a fake. Distinct from
adding `storage.remove` (a new method). Distinct from remount-after-cap
(composition of `.1092` + `.1097`).

## Claim

The closed host-lifecycle CapResult deny codes are exactly:

- `scope_denied`
- `unknown_method`
- `unknown_capability`
- `not_mounted`
- `already_mounted`
- `unknown_mini`
- `bad_deeplink`
- `storage_cap`

No silent ninth code without PLAN. Judge-owned hardcoded list in
tests; production `CAPABILITY_DENY_CODES` / `HOST_LIFECYCLE_DENY_CODES`
must match. A production `code: '…'` literal outside the closed set
fails. Each of the eight is emitted live on MiniHost — the list is
not a comment that never runs.

Scoped-stub codes `stub` and `photos_stub` stay in the complete
`CapabilityDenyCode` set. They are not host-lifecycle denies and
are not a license to add a tenth code.

Known-method envelopes stay `.1079`–`.1097`. No new method. No
new door. No new mini.

## Accept

1. Hardcoded host-lifecycle list is exactly the eight codes above
   (order as written). Production `HOST_LIFECYCLE_DENY_CODES`
   deep-equals that list. Production `CAPABILITY_DENY_CODES`
   deep-equals those eight plus `stub` and `photos_stub`.
2. Each of the eight is emitted live from MiniHost / `call` /
   deeplink (hardcoded envelopes). Distinct from each other.
3. Discover production `code: '…'` literals under `mission-os/`,
   `mw-core/src/module/`, and `minis/` (not an enumerated file
   list). A literal outside the closed complete set fails. A
   stale allowlist entry that never emits also fails.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected codes hardcoded in tests, not read back from
   production as the source of truth.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No `storage.remove`
/ `delete`. No remount-after-cap rewrite. No change to
`.1079`–`.1097` envelopes. No raising the storage cap.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
