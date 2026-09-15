# Paper .1102 — Identity remount after inject

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

`.1093` closed dual-mount identity isolation while both live.
`.1099` closed leftover `storage_cap` occupancy dying on remount.
`.1101` deferred identity remount-after-cap. This hop closes that
leftover on **one door** — identity.

## Goal

Close the identity remount hole `.1093` + `.1099` left implicit:
`injectIdentitySnapshot` on a live Health fake is per-instance.
`unmount` + remount binds the host snapshot again. Leftover inject
dies — remounted `identity.read` is the host-bound envelope, not
the override. B.read is untouched. Distinct from live dual-mount
isolation (`.1093`). Distinct from storage remount-after-cap
(`.1099`). Distinct from deeplink remount (`.1101`). No ninth
deny code. Billing / photos remount-after-inject stay later hops.

## Claim

After Health (`l1.health`) and `test.granted` mount with distinct
per-mini host snapshots:

- inject on Health overrides Health.read only
- Granted.read stays the granted envelope
- unmount Health — Granted.read stays; Health.call is
  `{ ok: false, code: 'not_mounted' }`
- remount Health binds the **host** snapshot again — not the
  leftover inject, not guest-null unless the host said so
- remounted identity is a new instance — inject on the old
  fake does not change remounted.read
- inject on remounted still does not change Granted.read
- after a `storage_cap` refuse + inject + unmount+remount,
  identity is still host-bound (leftover inject dies; storage
  remount-after-cap stays `.1099`)
- `host.call` identity.read after remount matches the fake
- ClearShot remount after inject also rebinds the host snapshot
- `test.noidentity` remount stays `{ ok: false, code: 'scope_denied' }`

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
billing / photos remount-after-inject rewrite.

CapResult envelopes for known methods stay `.1079`–`.1101`
(`scope_denied` / `photos_stub` / stub success / `unknown_method`
/ `unknown_capability` / `already_mounted` / `unknown_mini` /
`not_mounted` / `bad_deeplink` / `storage_cap` / storage miss /
identity / billing / photos isolation / `storage.remove` /
deeplink remount).

## Accept

1. Inject Health, unmount, remount: remounted.read is the
   hardcoded host snapshot, not the leftover override. Does
   not throw. Granted.read is unchanged. `host.call` matches.
2. Inject on the old fake after remount does not change
   remounted.read. Inject on remounted does not change
   Granted.read. After `storage_cap` + inject + remount,
   identity is still host-bound.
3. ClearShot remount after inject rebinds its host snapshot.
   `test.noidentity` remount stays `scope_denied`. Dual-mount
   isolation (`.1093`) and storage remount-after-cap (`.1099`)
   stay. No ninth deny code.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected envelopes hardcoded in tests, not read back from
   production as the source of truth.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No `storage.clear`
/ `delete` as a known method. No new deny code. No billing /
photos remount-after-inject. No change to `.1079`–`.1101`
envelopes.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
