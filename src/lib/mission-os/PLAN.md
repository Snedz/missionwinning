# Paper .1107 — Photos remount after inject

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

`.1095` closed dual-mount photos isolation while both live.
`.1099` closed leftover `storage_cap` occupancy dying on remount.
`.1102` closed identity remount-after-inject. `.1103` closed
billing remount-after-inject. This hop closes that leftover on
**one door** — photos.

## Goal

Close the photos remount hole `.1095` + `.1099` + `.1102` + `.1103`
left implicit: `injectPhotosSnapshot` on a live photos-scoped fake
is per-instance. `unmount` + remount binds the host photos snapshot
again. Leftover inject dies — remounted `photos.read` is the
host-bound stub envelope, not the override. Sibling.read is
untouched. Distinct from live dual-mount isolation (`.1095`).
Distinct from storage remount-after-cap (`.1099`). Distinct from
identity remount (`.1102`) and billing remount (`.1103`). No ninth
deny code. Four-door remount-after-inject is now closed.

## Claim

After `test.granted` and ClearShot mount with distinct per-mini
host photos snapshots:

- inject on `test.granted` overrides photos.read only
- ClearShot.read stays the ClearShot host envelope
- unmount `test.granted` — ClearShot.read stays; granted.call is
  `{ ok: false, code: 'not_mounted' }`
- remount `test.granted` binds the **host** photos snapshot
  again — not the leftover inject
- remounted photos is a new instance — inject on the old
  fake does not change remounted.read
- inject on remounted still does not change ClearShot.read
- after a `storage_cap` refuse + inject + unmount+remount on
  `test.granted` (the photos mini that also has storage.write),
  photos is still host-bound (leftover inject dies; storage
  remount-after-cap stays `.1099`)
- `host.call` photos.read after remount matches the fake
- ClearShot remount after inject rebinds its host photos
  snapshot — leftover inject dies (new fake from host options)
- ClearShot remount with no host snapshot stays
  `{ ok: false, code: 'photos_stub' }` — leftover inject
  cannot grant photos
- Health remount stays `{ ok: false, code: 'scope_denied' }`
  even with a host photos snapshot (no photos scope)
- `test.billing` remount stays `{ ok: false, code: 'scope_denied' }`
  (no photos scope — leftover inject cannot grant photos)

Host-lifecycle deny codes stay the frozen eight (`.1098`):

- `scope_denied`
- `unknown_method`
- `unknown_capability`
- `not_mounted`
- `already_mounted`
- `unknown_mini`
- `bad_deeplink`
- `storage_cap`

No silent ninth code. No `storage.clear` as a known method. No
new product mini. No Stripe I/O. No camera. No MediaStore.

CapResult envelopes for known methods stay `.1079`–`.1106`
(`scope_denied` / `photos_stub` / stub success / `unknown_method`
/ `unknown_capability` / `already_mounted` / `unknown_mini` /
`not_mounted` / `bad_deeplink` / `storage_cap` / storage miss /
identity / billing / photos isolation / `storage.remove` /
deeplink remount / identity remount / billing remount).

## Accept

1. Inject `test.granted`, unmount, remount: remounted.read is the
   hardcoded host stub snapshot, not the leftover override. Does
   not throw. ClearShot.read is unchanged. `host.call` matches.
2. Inject on the old fake after remount does not change
   remounted.read. Inject on remounted does not change
   ClearShot.read. After `storage_cap` + inject + remount,
   photos is still host-bound.
3. ClearShot remount after inject rebinds its host photos
   snapshot (new fake; leftover inject dies). ClearShot remount
   with no host snapshot stays `photos_stub` (leftover inject
   cannot grant). Health / `test.billing` remount stay
   `scope_denied`. Dual-mount isolation (`.1095`), identity
   remount (`.1102`), billing remount (`.1103`), and storage
   remount-after-cap (`.1099`) stay. No ninth deny code.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected envelopes hardcoded in tests, not read back from
   production as the source of truth.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No `storage.clear`
/ `delete` as a known method. No new deny code. No change to
`.1079`–`.1106` envelopes.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
