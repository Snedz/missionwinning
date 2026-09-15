# Paper .1094 — Dual-mount CapResult billing isolation

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

## Goal

Close the concurrent-mount hole `.1079` / host-wide `MUTED_BILLING`
left implicit: two different minis mounted at once, both declaring
`billing.read`, must each see only their own injected billing
snapshot. Injecting or mutating A's snapshot must not change
`B.read`. Identity isolation (`.1093`) and storage isolation
(`.1092`) stay unchanged. Unscoped billing stays `scope_denied`.

## Claim

Two different minis mounted at once with billing scope have isolated
billing CapResult envelopes: `A.billing.read()` is A's muted snapshot,
not B's. `B.billing.read()` is B's muted snapshot, not A's.
`checkout` / `portal` stay the scoped `{ held: true }` stub on each
granted door — they do not become a second shared live session.
Changing A's snapshot through the fake-only inject hook does not
alter `B.read`.

Isolation is per mount id on the in-memory host (`MiniHostOptions.billings[id]`
plus a fake-only `injectBillingSnapshot`). It is not the host-wide
`opts.billing` default (`.1079` still injects the same muted
`none` snapshot when no per-mini row is set). It is not identity
snapshot isolation (`.1093`). It is not storage keyspace isolation
(`.1092`). It is not `scope_denied` (`.1079`) — that hop locked the
unscoped deny, not both-live distinct snapshots.

Without billing scope, every billing method still returns
`{ ok: false, code: 'scope_denied' }` even if a snapshot was injected
for that id.

CapResult envelopes for known methods stay `.1079`–`.1093` while
both live (`scope_denied` / `photos_stub` / stub success /
`unknown_method` / `already_mounted` / `unknown_mini` /
`not_mounted` / `bad_deeplink` / storage miss / identity isolation).

## Accept

1. Mount A and B with distinct injected billing snapshots (host
   `billings` map, or fixture constructors). `A.read` ≠ `B.read`.
   Hardcoded expected envelopes in tests.
2. Changing A's snapshot via the fake-only inject hook does not
   alter `B.read`. A's read becomes the new muted envelope.
   Mutating the options object after mount does not leak into B.
3. Without billing scope, `read` / `checkout` / `portal` still →
   `scope_denied` (`.1079`) — even when a snapshot is injected for
   that id.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected envelopes hardcoded in tests.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No live Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No change to
identity isolation (`.1093`). No change to storage isolation
(`.1092`). No change to `already_mounted`, `unknown_mini`,
`not_mounted`, or `bad_deeplink`.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
