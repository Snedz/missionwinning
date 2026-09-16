# Paper .1108 — Storage remount leftover old-fake writes

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

`.1092` closed dual-mount storage isolation while both live.
`.1078` / `.1099` closed remount starting empty (including after
`storage_cap`). `.1102` / `.1103` / `.1107` closed leftover inject
dying on remount for identity / billing / photos. Storage has no
inject. This hop closes that leftover on **one door** — storage
writes on the old fake after remount.

## Goal

Close the storage remount hole `.1078` + `.1092` + `.1099` + the
snapshot remount hops left implicit: `storage.set` / `storage.remove`
on a live fake is per-instance. `unmount` + remount binds a **new**
store. Leftover writes on the old fake die — remounted `get` /
occupancy is the empty host-bound map, not the leftover set.
Sibling storage stays. Distinct from live dual-mount isolation
(`.1092`). Distinct from remount-after-cap emptiness (`.1099`).
Distinct from snapshot remount-after-inject (`.1102` / `.1103` /
`.1107`). No ninth deny code. No `storage.clear` as a known method.

## Claim

After Health and `test.granted` mount with isolated storage maps:

- set on Health writes Health only
- Granted.get stays miss / Granted's own value
- unmount Health — Granted stays; health.call is
  `{ ok: false, code: 'not_mounted' }`
- remount Health starts empty — not the leftover set (`.1078`)
- remounted storage is a new instance — set / remove on the old
  fake does not write remounted
- set on remounted still does not change Granted
- after a `storage_cap` refuse + unmount+remount, old-fake set
  does not write remounted and does not re-cap remounted
  (storage remount-after-cap stays `.1099`)
- `host.call` storage.get / set after remount matches the fake
- ClearShot remount: old-fake set does not occupy remounted
  (get stays `scope_denied`; remounted can still fill 32)
- `test.nostorage` remount stays `{ ok: false, code: 'scope_denied' }`
  — leftover set cannot grant write
- `test.billing` remount stays `{ ok: false, code: 'scope_denied' }`
  (no storage scope — leftover set cannot grant write)

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

CapResult envelopes for known methods stay `.1079`–`.1107`
(`scope_denied` / `photos_stub` / stub success / `unknown_method`
/ `unknown_capability` / `already_mounted` / `unknown_mini` /
`not_mounted` / `bad_deeplink` / `storage_cap` / storage miss /
identity / billing / photos isolation / `storage.remove` /
deeplink remount / identity remount / billing remount /
photos remount).

## Accept

1. Set Health, unmount, remount: remounted.get is miss, not the
   leftover value. Set on the old fake after remount does not
   write remounted. Does not throw. Granted is unchanged.
   `host.call` matches.
2. Remove on the old fake after remount does not delete
   remounted keys. Set on remounted does not change Granted.
   After `storage_cap` + remount, old-fake set does not write
   remounted and remounted is not still capped.
3. ClearShot remount: old-fake set does not occupy remounted
   (get stays `scope_denied`; remounted can fill 32).
   `test.nostorage` / `test.billing` remount stay `scope_denied`.
   Dual-mount isolation (`.1092`), remount-after-cap (`.1099`),
   and snapshot remount-after-inject (`.1102` / `.1103` /
   `.1107`) stay. No ninth deny code.
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
`.1079`–`.1107` envelopes. No snapshot-inject rewrite.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
