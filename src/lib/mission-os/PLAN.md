# Paper .1093 — Dual-mount CapResult identity isolation

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

## Goal

Close the concurrent-mount hole `.1082` / host-wide `opts.identity`
left implicit: two different minis mounted at once, both declaring
`identity.read`, must each see only their own injected identity
snapshot. Injecting or overriding A's snapshot must not change
`B.read`. Storage isolation (`.1092`) and all prior CapResult codes
stay unchanged.

## Claim

Two different minis mounted at once with identity scope have isolated
identity snapshots: `A.identity.read()` is A's envelope, not B's.
`B.identity.read()` is B's envelope, not A's. Changing A's snapshot
through the fake-only inject hook does not alter `B.read`.

Isolation is per mount id on the in-memory host (`MiniHostOptions.identities[id]`
plus a fake-only `injectIdentitySnapshot`). It is not the host-wide
`opts.identity` default (`.1082` still injects the same guest/host
snapshot when no per-mini row is set). It is not storage keyspace
isolation (`.1092`). It is not `scope_denied` (`.1082`) — that hop
locked the unscoped deny, not both-live distinct snapshots.

Without identity scope, `identity.read` still returns
`{ ok: false, code: 'scope_denied' }` even if a snapshot was injected
for that id.

CapResult envelopes for known methods stay `.1079`–`.1092` while
both live (`scope_denied` / `photos_stub` / stub success /
`unknown_method` / `already_mounted` / `unknown_mini` /
`not_mounted` / `bad_deeplink` / storage miss).

## Accept

1. Mount A and B with distinct injected identity snapshots (host
   `identities` map, or fixture constructors). `A.read` ≠ `B.read`.
   Hardcoded expected envelopes in tests.
2. Changing A's snapshot via the fake-only inject hook does not
   alter `B.read`. A's read becomes the new envelope.
3. Without identity scope, `identity.read` still → `scope_denied`
   (`.1082`) — even when a snapshot is injected for that id.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected envelopes hardcoded in tests.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No production auth. No `PRIVATE_MODE`
flip. No tip-promote. Live www stays `.697`. ClearShot Android
cash stays Next ONE. No new product mini. No Android product work.
No change to storage isolation (`.1092`). No change to
`already_mounted`, `unknown_mini`, `not_mounted`, or
`bad_deeplink`.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
