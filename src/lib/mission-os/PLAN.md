# Paper .1088 — MiniHost.unmount not_mounted

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

## Goal

Close the host-lifecycle hole `.1087` left open: `MiniHost.unmount(id)`
when the id is not currently mounted must refuse with a consistent
CapResult, not reuse `unknown_mini` (that code is for mount / peek of
an id the host does not know). Does not throw. Live unmount still
succeeds and clears storage (`.1078`).

## Claim

`MiniHost.unmount(id)` when the id is not currently mounted returns
`{ ok: false, code: 'not_mounted' }`. Same CapResult deny shape as
the other host errors. Does not throw. Unmount of a live mount still
returns ok and clears that mini's fake keyspace (`.1078`).
`unknown_mini` (`.1087`) and `already_mounted` (`.1086`) stay unchanged.

`not_mounted` is a lifecycle refuse — the id is not in the mounted
table right now. It is not `unknown_mini` (allowlist / peek miss) and
not `already_mounted` (second mount while live).

## Accept

1. `unmount('never.mounted')` → `{ ok: false, code: 'not_mounted' }`
   — hardcoded in tests. Does not throw.
2. Unmount after a successful mount → ok; `listMounted` is empty;
   remount cannot read leftover storage (`.1078`).
3. Double-unmount: the second call → `not_mounted`.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected codes hardcoded in tests.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No change to
`unknown_mini` on mount / peek. No change to `already_mounted`.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
