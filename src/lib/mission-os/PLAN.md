# Paper .1086 — MiniHost mount-duplicate refuse

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

## Goal

Close the last host-lifecycle hole: a second `MiniHost.mount` of an id
that is still mounted must refuse. Same CapResult deny shape as the
other host errors. Does not throw. Does not replace the live instance.

## Claim

`MiniHost.mount(manifest)` refuses a second mount of the same mini id
while that id is still mounted. Return
`{ ok: false, code: 'already_mounted' }`. Caller must `unmount` first
(`.1078`). Remount after unmount succeeds and cannot read leftover
storage (existing isolation).

Manifest validation stays first: a bad entry is still `stub` and does
not replace. `already_mounted` is the next gate, after a valid
manifest, when `mounted.has(id)`.

## Accept

1. First mount of a known test mini succeeds.
2. Second mount of the same id while mounted returns
   `{ ok: false, code: 'already_mounted' }` — does not throw, does not
   replace the live instance (first handle still works; inventory
   scopes stay the first mount's).
3. After unmount, remount succeeds; storage isolation from `.1078`
   still holds (no leftover keys).
4. `listMounted` reflects one entry while mounted, zero after unmount.
5. Unit tests under `src/lib/mission-os/`; judge ≠ builder — expected
   codes hardcoded in tests.
6. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
