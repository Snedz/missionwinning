# Paper .1109 — Leftover Health extras cannot grant billing

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

`.1079` closed unscoped billing deny. `.1094` / `.1103` closed live
isolation and remount leftover inject on billing-scoped minis.
`.1108` closed leftover storage writes on the old fake. Bind still
stored the live grant document. Leftover extras on a Health-shaped
manifest could grant `billing.read`. This hop closes that leftover
on **one door** — billing on Health.

## Goal

Close the Health billing-grant hole leftover inject / leftover
writes left implicit: `MiniHost.mount` binds a **copy** of declared
scopes and pins reserved Health scopes. Leftover extras on the
passed document — live push, first-mount extras, or remount of
the mutated object — cannot grant `billing.read` / checkout /
portal. Granted sibling stays. Distinct from live billing isolation
(`.1094`). Distinct from billing remount-after-inject (`.1103`).
Distinct from leftover old-fake storage writes (`.1108`). No ninth
deny code. ClearShot remount leftover extras on a mutated
ClearShot-shaped document stay the next hop.

## Claim

After Health and `test.granted` mount:

- extras on a Health-shaped document (`billing.read` already on
  the passed scopes) do not grant Health billing
- leftover push on the passed document after mount does not grant
- leftover push on the bound manifest does not grant (frozen copy)
- unmount Health — Granted.read stays; health.call billing is
  `{ ok: false, code: 'not_mounted' }`
- remount of the leftover extras document still cannot grant
  billing — remounted is reserved Health scopes
- `host.call` billing.read after remount is `scope_denied`
- `listMounted` peek of `billing.read` stays `scope_denied`
- after a `storage_cap` refuse + leftover extras + remount,
  billing is still denied (storage remount-after-cap stays `.1099`)
- ClearShot live leftover extras cannot grant billing (bound
  copy is frozen); reserved helper remount stays `scope_denied`
- `test.billing` remount still has billing — leftover Health
  extras cannot steal it
- Health remount stays `{ ok: false, code: 'scope_denied' }`
  on billing even with leftover extras

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
ClearShot remount leftover extras rewrite. No Stripe I/O.

CapResult envelopes for known methods stay `.1079`–`.1108`
(`scope_denied` / `photos_stub` / stub success / `unknown_method`
/ `unknown_capability` / `already_mounted` / `unknown_mini` /
`not_mounted` / `bad_deeplink` / `storage_cap` / storage miss /
identity / billing / photos isolation / `storage.remove` /
deeplink remount / identity remount / billing remount /
photos remount / leftover storage writes).

## Accept

1. Mount a Health-shaped document that already lists
   `billing.read`: Health billing is `scope_denied`. Does not
   throw. Granted.read is the muted envelope. `host.call` matches.
   `listMounted` peek of billing stays `scope_denied`.
2. Leftover push on the passed document after mount does not
   grant. Leftover push on the bound manifest does not grant.
   Remount of the leftover extras document still cannot grant.
   After `storage_cap` + extras + remount, billing is still denied.
3. ClearShot live leftover extras cannot grant billing.
   `test.billing` remount still has billing. Dual-mount billing
   isolation (`.1094`), billing remount (`.1103`), and leftover
   storage writes (`.1108`) stay. No ninth deny code.
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
`.1079`–`.1108` envelopes. No ClearShot remount leftover extras
pin. No snapshot-inject rewrite.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
