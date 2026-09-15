# Paper .1097 — CapResult storage_cap / MiniHost write bound

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

Dual-mount `listMounted` inventory (both ids + declared scopes;
unmount A drops A and keeps B; never-mounted `unknown_mini`;
undeclared peek `scope_denied`) is already closed tightly by `.1081`
(+ `.1092` id listing). This hop takes the next CapResult hole.

## Goal

Close the write-bound hole `.1083` / `.1092` left implicit: a scoped
storage `set` that exceeds the in-memory cap (32 keys / 4KB) must
refuse with a distinct CapResult code. It is not unscoped deny
(`scope_denied`). It is not an unknown method (`unknown_method`).
It is not a lifecycle miss (`not_mounted`). Does not throw. Does
not write the overflowing key or oversized value. Dual-mount
isolation stays — A's cap refuse does not wipe B. mw-core already
emits `storage_cap`; MiniHost / `call` / the storage fake had no
judge-owned lock.

## Claim

Scoped `storage.set` on MiniHost (Health / `test.granted` /
ClearShot write) returns CapResult `{ ok: false, code:
'storage_cap' }` when the value is over 4096 bytes or the write
would be a 33rd distinct key. One consistent code, hardcoded in
tests. Does not throw. Does not persist the refused write.
Overwrite of an existing key while already at 32 keys still
succeeds. A value of exactly 4096 bytes still succeeds.

Without storage.write, a huge `set` stays `scope_denied` (`.1083`)
— even when the value would have overflowed. An unmounted id stays
`not_mounted` (`.1089`) even when the value would have overflowed
(lifecycle first). Dual-mount storage isolation (`.1092`) stays:
A's cap refuse does not change B's map.

CapResult envelopes for known methods stay `.1079`–`.1096`
(`scope_denied` / `photos_stub` / stub success / `unknown_method` /
`unknown_capability` / `already_mounted` / `unknown_mini` /
`not_mounted` / `bad_deeplink` / storage miss).

## Accept

1. Scoped `set` of a 4097-byte value → `{ ok: false, code:
   'storage_cap' }` hardcoded. Does not throw. Does not write that
   key. Distinct from `scope_denied` / `unknown_method` /
   `not_mounted`. Same envelope via `storage.set` and `host.call`.
2. 33rd distinct key → `storage_cap` and is not stored. Overwrite
   of an existing key at 32 still → ok. Exactly 4096 bytes still →
   ok.
3. Unscoped (`test.nostorage`) huge `set` still → `scope_denied`
   and does not write. Unmounted id + huge `set` still →
   `not_mounted`. A's overflow does not wipe B's keys (`.1092`).
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected codes and bounds (32 / 4096) hardcoded in tests.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No change to
`listMounted`. No change to `unknown_capability` (`.1096`).
No change to dual-mount snapshot isolation (`.1093`–`.1095`).
No change to `already_mounted`, `unknown_mini`, `not_mounted`,
or `bad_deeplink`. No durable browser write. No raising the cap.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
