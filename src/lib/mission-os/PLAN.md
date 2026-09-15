# Paper .1103 — Billing remount after inject

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

`.1094` closed dual-mount billing isolation while both live.
`.1099` closed leftover `storage_cap` occupancy dying on remount.
`.1102` closed identity remount-after-inject. This hop closes that
leftover on **one door** — billing.

## Goal

Close the billing remount hole `.1094` + `.1099` + `.1102` left
implicit: `injectBillingSnapshot` on a live `test.billing` fake is
per-instance. `unmount` + remount binds the host billing snapshot
again. Leftover inject dies — remounted `billing.read` is the
host-bound muted envelope, not the override. B.read is untouched.
Distinct from live dual-mount isolation (`.1094`). Distinct from
storage remount-after-cap (`.1099`). Distinct from identity remount
(`.1102`). No ninth deny code. Photos remount-after-inject stays
the next hop.

## Claim

After `test.billing` and `test.granted` mount with distinct
per-mini host billing snapshots:

- inject on `test.billing` overrides billing.read only
- Granted.read stays the granted muted envelope
- unmount `test.billing` — Granted.read stays; billing.call is
  `{ ok: false, code: 'not_mounted' }`
- remount `test.billing` binds the **host** billing snapshot
  again — not the leftover inject
- remounted billing is a new instance — inject on the old
  fake does not change remounted.read
- inject on remounted still does not change Granted.read
- after a `storage_cap` refuse + inject + unmount+remount on
  `test.granted` (the billing mini that also has storage.write),
  billing is still host-bound (leftover inject dies; storage
  remount-after-cap stays `.1099`)
- `host.call` billing.read after remount matches the fake
- ClearShot remount after inject rebinds its host billing
  snapshot — leftover inject dies (new fake from host options);
  read / checkout / portal stay `scope_denied` (leftover inject
  cannot grant billing)
- Health remount stays `{ ok: false, code: 'scope_denied' }`
  even with a host billing snapshot (no billing scope)

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
photos remount-after-inject rewrite. No Stripe I/O.

CapResult envelopes for known methods stay `.1079`–`.1102`
(`scope_denied` / `photos_stub` / stub success / `unknown_method`
/ `unknown_capability` / `already_mounted` / `unknown_mini` /
`not_mounted` / `bad_deeplink` / `storage_cap` / storage miss /
identity / billing / photos isolation / `storage.remove` /
deeplink remount / identity remount).

## Accept

1. Inject `test.billing`, unmount, remount: remounted.read is the
   hardcoded host muted snapshot, not the leftover override. Does
   not throw. Granted.read is unchanged. `host.call` matches.
2. Inject on the old fake after remount does not change
   remounted.read. Inject on remounted does not change
   Granted.read. After `storage_cap` + inject + remount,
   billing is still host-bound.
3. ClearShot remount after inject rebinds its host billing
   snapshot (new fake; leftover inject dies; billing stays
   `scope_denied`). Health remount stays `scope_denied`.
   Dual-mount isolation (`.1094`), identity remount (`.1102`),
   and storage remount-after-cap (`.1099`) stay. No ninth deny
   code.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected envelopes hardcoded in tests, not read back from
   production as the source of truth.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No `storage.clear`
/ `delete` as a known method. No new deny code. No photos
remount-after-inject. No change to `.1079`–`.1102` envelopes.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
