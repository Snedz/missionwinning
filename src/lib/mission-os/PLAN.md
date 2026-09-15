# Paper .1092 — Dual-mount CapResult storage isolation

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

## Goal

Close the concurrent-mount hole `.1078` left implicit: two different
minis mounted at once (Health + ClearShot, or test fixtures that both
declare storage) must keep isolated storage keyspaces. A set on A is
invisible to a get on B. Unmount A does not wipe B. Remount A starts
empty (`.1078`). `listMounted` returns both ids while both live.
Known-method CapResult envelopes stay `.1079`–`.1091`.

## Claim

Two different minis mounted at once have isolated storage keyspaces:
`A.set(k, v)` then `B.get(k)` is a miss / null / ok-empty per the
existing storage stub — not A's value. Unmount A leaves B's keys.
Remount A cannot read leftovers. `listMounted` includes both ids
while both are mounted.

Isolation is per mount id on the in-memory host (`storeFor(stores,
id)`). It is not a shared last-write-wins map. It is not
`already_mounted` (same id, `.1086`). It is not unmount-of-self
leftover wipe (`.1078`) alone — that hop did not lock the
both-live + unmount-A-keeps-B accept.

CapResult envelopes for known methods stay `.1079`–`.1091` while
both live (`scope_denied` / `photos_stub` / stub success /
`unknown_method` / `already_mounted` / `unknown_mini` /
`not_mounted` / `bad_deeplink`).

## Accept

1. Mount A and B (both with storage scope). `A.set(k, v)` then
   `B.get(k)` → miss / null / ok-empty per existing storage stub —
   NOT A's value. Hardcoded in tests.
2. Unmount A; `B.get` still returns B's own keys; remount A starts
   empty (`.1078`).
3. `listMounted` includes both ids while both are mounted.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected values hardcoded in tests.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No change to
`already_mounted`, `unknown_mini`, `not_mounted`, or
`bad_deeplink`. No durable browser write.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
