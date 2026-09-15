# Paper .1087 — MiniHost unknown-id refuse

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

## Goal

Close the host-lifecycle hole `.1086` left open: `MiniHost.mount` of an
id that is not in the known mini allowlist must refuse. Same CapResult
deny shape as never-mounted peek / unmount (`unknown_mini`). Does not
throw. Does not create a partial mount.

## Claim

`MiniHost.mount` of an id that is not in the closed host allowlist
returns `{ ok: false, code: 'unknown_mini' }`. Caller cannot invent a
mini by passing a valid-looking unknown manifest. Known test minis
still mount. `already_mounted` (`.1086`) and unmount isolation
(`.1078`) stay unchanged for known ids.

Manifest validation stays first: a bad entry is still `stub` and does
not list. `unknown_mini` is the next gate, after a valid manifest,
when the id is not allowlisted. `already_mounted` stays after that,
when `mounted.has(id)`.

## Accept

1. `mount('totally.unknown')` → `{ ok: false, code: 'unknown_mini' }`
   — hardcoded in tests. Does not throw.
2. No entry appears in `listMounted` after a failed unknown mount
   (empty list; peek of that id is `unknown_mini`).
3. Known test minis still mount / `already_mounted` / unmount as
   before (`l1.health`, `utility.clearshot`, existing test fixtures).
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected codes hardcoded in tests.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. Test fixtures already
used by the host stay allowlisted; they are not product mounts and
stay out of `MINI_REGISTRY`.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
