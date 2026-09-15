# Paper .1095 — Dual-mount CapResult photos isolation

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

## Goal

Close the concurrent-mount hole `.1080` / host-wide `photos_stub`
left implicit: two different minis mounted at once, both declaring
photos, must each see only their own injected photos snapshot.
Injecting or mutating A's snapshot must not change `B.read`.
Storage isolation (`.1092`), identity isolation (`.1093`), and
billing isolation (`.1094`) stay unchanged. Unscoped photos stays
`scope_denied`. No snapshot still stays `photos_stub`.

## Claim

Two different minis mounted at once with photos scope have isolated
photos CapResult envelopes: `A.photos.read()` is A's stub snapshot,
not B's. `B.photos.read()` is B's stub snapshot, not A's.
`write` on a granted door with a bound snapshot is the same isolated
stub envelope — it does not become a shared camera / MediaStore.
Changing A's snapshot through the fake-only inject hook does not
alter `B.read`.

Isolation is per mount id on the in-memory host (`MiniHostOptions.photoses[id]`
plus a fake-only `injectPhotosSnapshot`). It is not the host-wide
`opts.photos` default (`.1080` still returns `photos_stub` when no
per-mini row is set). It is not identity snapshot isolation
(`.1093`). It is not billing snapshot isolation (`.1094`). It is
not storage keyspace isolation (`.1092`). It is not `scope_denied`
(`.1080`) — that hop locked the unscoped deny, not both-live
distinct snapshots.

Without photos scope, every photos method still returns
`{ ok: false, code: 'scope_denied' }` even if a snapshot was injected
for that id. Health stays denied. ClearShot with no bound snapshot
stays `photos_stub`.

CapResult envelopes for known methods stay `.1079`–`.1094` while
both live (`scope_denied` / `photos_stub` / stub success /
`unknown_method` / `already_mounted` / `unknown_mini` /
`not_mounted` / `bad_deeplink` / storage miss / identity isolation /
billing isolation).

## Accept

1. Mount A and B with distinct injected photos snapshots (host
   `photoses` map, or fixture constructors). `A.read` ≠ `B.read`.
   Hardcoded expected envelopes in tests.
2. Changing A's snapshot via the fake-only inject hook does not
   alter `B.read`. A's read becomes the new stub envelope.
   Mutating the options object after mount does not leak into B.
3. Without photos scope, `read` / `write` still → `scope_denied`
   (`.1080`) — even when a snapshot is injected for that id.
   Health stays denied. ClearShot with no bound snapshot stays
   `photos_stub`.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected envelopes hardcoded in tests.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No live Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No ClearShot product
UI. No change to identity isolation (`.1093`). No change to
billing isolation (`.1094`). No change to storage isolation
(`.1092`). No change to `already_mounted`, `unknown_mini`,
`not_mounted`, or `bad_deeplink`.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
