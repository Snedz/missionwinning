# Paper .1101 — Deeplink remount already_mounted

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

`.1086` closed `already_mounted` on `MiniHost.mount`. `.1090` /
`.1091` closed unknown / bad deeplink. `.1098` froze the eight
host-lifecycle codes. This hop closes the leftover composition:
resolve a known URI, then remount that same id via the deeplink
door.

## Goal

Close the deeplink-remount hole `.1086` + `.1090` left implicit:
`resolveMiniDeeplink` of `mission://minis/health` or
`mission://minis/clearshot` is a lookup — it does not mount.
`mountMiniByDeeplink` of that same URI while the id is live
returns `{ ok: false, code: 'already_mounted' }`. Does not throw.
Does not replace the live instance. Does not wipe storage.
`listMounted` stays one row for that id. Distinct from direct
`MiniHost.mount` remount (`.1086`). Distinct from unknown /
bad deeplink (`.1090` / `.1091`). Distinct from remount-after-cap
(`.1099`) and `storage.remove` (`.1100`). No ninth deny code.

## Claim

After `resolveMiniDeeplink` of a known last-segment URI succeeds
(Health `mission://minis/health` → `l1.health`, ClearShot
`mission://minis/clearshot` → `utility.clearshot`):

- resolve does not mount — `listMounted` stays empty until
  `mountMiniByDeeplink`
- first `mountMiniByDeeplink` of that URI is `ok`
- resolve of the same URI while mounted is still `ok` (lookup
  is not a remount) and does not wipe storage
- second `mountMiniByDeeplink` of the same URI is
  `{ ok: false, code: 'already_mounted' }` — does not throw,
  does not replace the live instance, does not wipe keys
  written before the remount attempt, does not grow
  `listMounted`
- `host.mount(resolved.value)` of a live id is the same
  `already_mounted` envelope as `mountMiniByDeeplink`
- Health remount-via-deeplink does not touch a live ClearShot
  (and the reverse)
- after unmount, the same deeplink remounts empty — prior
  keys miss

Unknown last-segment stays `unknown_mini` (`.1090`). Malformed
URI stays `bad_deeplink` (`.1091`). Direct `mountHealthMini`
remount stays `already_mounted` (`.1086`). Host-lifecycle deny
codes stay the frozen eight (`.1098`) — no silent ninth code.
No `storage.clear` as a known method. No remount-after-cap
rewrite. No identity / billing / photos remount-after-cap.

CapResult envelopes for known methods stay `.1079`–`.1100`
(`scope_denied` / `photos_stub` / stub success / `unknown_method`
/ `unknown_capability` / `already_mounted` / `unknown_mini` /
`not_mounted` / `bad_deeplink` / `storage_cap` / storage miss /
identity / billing / photos isolation / `storage.remove`).

## Accept

1. Resolve `mission://minis/health` does not mount. First
   `mountMiniByDeeplink` is `ok`. Second is hardcoded
   `{ ok: false, code: 'already_mounted' }`. Does not throw.
   Live storage / identity stay. `listMounted` is one Health
   row. Same sequence for `mission://minis/clearshot`.
2. Resolve while mounted is still `ok` and does not wipe
   keys. `host.mount(resolved.value)` of the live id is
   `already_mounted`. Health remount-via-deeplink leaves
   ClearShot untouched (and the reverse).
3. After unmount, the same deeplink remounts; prior keys
   miss. Unknown / bad deeplink stay `.1090` / `.1091`.
   Direct remount stays `.1086`. No ninth deny code.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected codes hardcoded in tests, not read back from
   production as the source of truth.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No `storage.clear`
/ `delete` as a known method. No new deny code. No remount-after-cap
rewrite. No identity / billing / photos remount-after-cap. No
change to `.1079`–`.1100` envelopes.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
