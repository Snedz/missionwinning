# Paper .1090 — Deeplink unknown last-segment refuse

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

## Goal

Close the resolve hole `.1077` / `.1087` left open: last-segment
`mission://minis/<segment>` when `<segment>` is not in the closed
deeplink table (and is not a host-allowlisted product slug) must
refuse. Same CapResult deny shape as `MiniHost.mount` unknown_mini
(`.1087`). Does not throw. Does not mount. Known `health` /
`clearshot` keep current mount behavior.

## Claim

Resolving `mission://minis/<segment>` when `<segment>` is not in the
deeplink table / host allowlist returns CapResult
`{ ok: false, code: 'unknown_mini' }` (same code as mount
`unknown_mini` `.1087`). Does not throw. Does not mount. Known
segments (`health`, `clearshot`, and existing test fixtures via their
direct mount helpers) keep current mount behavior.

`unknown_mini` is a table miss — the last-segment is not a reserved
deeplink. It is not `not_mounted` (lifecycle, `.1088` / `.1089`) and
not `already_mounted` (second mount while live, `.1086`). Test-fixture
slugs (`billing`, `granted`, …) stay out of the deeplink table even
though those ids are host-allowlisted.

## Accept

1. resolve / deeplink for `mission://minis/totally-unknown` →
   `{ ok: false, code: 'unknown_mini' }` hardcoded. Does not throw.
   Does not mount (`listMounted` stays empty).
2. Known `mission://minis/health` and `mission://minis/clearshot`
   still mount as before.
3. Mount / call / unmount CapResult codes from `.1078`–`.1089`
   unchanged.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected codes hardcoded in tests.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No third deeplink
slug. No change to `unknown_mini` on mount / peek. No change to
`already_mounted`. No change to unmount / call `not_mounted`.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
