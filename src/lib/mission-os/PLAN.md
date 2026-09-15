# Paper .1099 — Remount after storage_cap

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

`.1097` closed the write-bound refuse. `.1092` closed remount-empty
after a *successful* write. `.1098` froze the deny-code set and named
this composition as a non-goal. This hop closes that leftover.

## Goal

Close the remount-after-cap hole `.1092` + `.1097` left implicit: after
A hits `storage_cap` (33rd key or oversized value), `unmount` + remount
A starts empty. B stays untouched. No leftover overflow occupancy —
the first in-bound write after remount is `ok`, not another
`storage_cap`. Distinct from adding `storage.remove` (a new method).
Distinct from the deny-code freeze (`.1098`). Distinct from remount
after a successful write (`.1092` / `.1078`).

## Claim

After mini A hits `{ ok: false, code: 'storage_cap' }` on a scoped
`storage.set` (33rd distinct key, or a value over 4096 bytes),
`MiniHost.unmount(A)` then remount A:

- remounted A starts empty — prior keys miss (`{ ok: true, value:
  undefined }` on Health / `test.granted`; ClearShot get stays
  `scope_denied`)
- the first in-bound write after remount succeeds — remount is not
  still capped
- remounted A can fill 32 keys / 4096 bytes again; the 33rd / oversized
  write is still `storage_cap` (the bound did not lift)
- B's keyspace is untouched through A's cap, unmount, and remount
- no leftover overflow state — no ninth deny code, no sticky occupancy
  flag, no refused key that appears after remount

Unscoped huge set stays `scope_denied` (`.1083` / `.1097`). Unmounted
call stays `not_mounted` (`.1089`). Host-lifecycle deny codes stay
the frozen eight (`.1098`) — no silent ninth code. No `storage.remove`.

CapResult envelopes for known methods stay `.1079`–`.1098`
(`scope_denied` / `photos_stub` / stub success / `unknown_method` /
`unknown_capability` / `already_mounted` / `unknown_mini` /
`not_mounted` / `bad_deeplink` / `storage_cap` / storage miss /
identity / billing / photos isolation).

## Accept

1. Mount A and B. Fill A to 32 keys. The 33rd is `storage_cap` and
   does not write. Unmount A. B still holds its keys. Remount A:
   prior keys miss; first in-bound write is `ok`; A can fill 32
   again; 33rd is still `storage_cap`. Hardcoded envelopes.
2. Same sequence after an oversized (>4096) refuse that followed a
   valid write: remount misses the valid key; exact 4096 succeeds;
   oversized is still `storage_cap`. B untouched.
3. `host.call` after remount matches the fake (miss / ok / cap).
   Unmount A does not wipe B. No ninth deny code.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected envelopes and bounds hardcoded in tests, not read back
   from `STORAGE_MAX_*` as the overflow size.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No `storage.remove`
/ `delete`. No new deny code. No raising the storage cap. No
change to `.1079`–`.1098` envelopes.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
