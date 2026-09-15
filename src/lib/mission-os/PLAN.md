# Paper .1089 — CapResult call when mini not mounted

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

## Goal

Close the dispatch hole `.1088` left open: a capability call
(identity / billing / photos / storage) for a mini id that is not
currently mounted must refuse with the same CapResult as
`MiniHost.unmount` not-mounted. Does not throw. Does not auto-mount.
Mounted minis keep `.1079`–`.1087` envelopes.

## Claim

Dispatching a capability call (identity / billing / photos / storage)
for a mini id that is not currently mounted returns CapResult
`{ ok: false, code: 'not_mounted' }` — same code as unmount-not-mounted
(`.1088`). Does not throw. Does not auto-mount. Mounted minis keep
`.1079`–`.1087` envelopes.

`not_mounted` is a lifecycle refuse — the id is not in the mounted
table right now. It is not `unknown_mini` (allowlist / peek miss) and
not `already_mounted` (second mount while live).

## Accept

1. After no mounts (or after unmount), call `identity.read` /
   `storage.get` / etc. for that id → `{ ok: false, code: 'not_mounted' }`
   hardcoded. Does not throw. Does not auto-mount.
2. Mount then call known methods → existing allow / deny envelopes
   unchanged (`.1079`–`.1087`).
3. `unknown_mini` / `already_mounted` / unmount `not_mounted` stay
   unchanged.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected codes hardcoded in tests.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No change to
`unknown_mini` on mount / peek. No change to `already_mounted`.
No change to unmount `not_mounted`.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
