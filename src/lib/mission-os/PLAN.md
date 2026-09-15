# Paper .1096 — CapResult unknown_capability / closed door set

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

## Goal

Close the door-set hole `.1085` left open: a capability name that is
not in the closed door set (`identity` / `billing` / `photos` /
`storage`) must refuse with a distinct CapResult code. It is not an
undeclared known door (`scope_denied`). It is not an unknown method
on a known door (`unknown_method`). It is not a lifecycle miss
(`not_mounted`). Does not throw. Does not invent a fifth door.
Mounted minis keep `.1079`–`.1095` envelopes on known doors.

## Claim

`callDoor` / `callMountedDoor` / `MiniHost.call` reject a door name
outside the closed set with CapResult
`{ ok: false, code: 'unknown_capability' }`. One consistent code,
hardcoded in tests. Does not throw. Does not dispatch. Does not
write storage.

`scope_denied` (`.1079`–`.1083`) stays for a *known* door the mini
did not declare. `unknown_method` (`.1085`) stays for a known
declared door + a name outside that door's closed methods.
`not_mounted` (`.1089`) stays when the mini id is not currently
mounted — even if the door name is also unknown (lifecycle first).

The closed door set stays exactly `identity`, `billing`, `photos`,
`storage`. A fifth name is this refuse, not a silent extra door.

## Accept

1. Mounted mini + door `camera` / `health` / `location` / `foo` /
   empty string / `identity.read` → `{ ok: false, code:
   'unknown_capability' }` hardcoded. Does not throw. Does not
   write. Distinct from `scope_denied` / `unknown_method` /
   `not_mounted`.
2. Known undeclared door still → `scope_denied`. Known declared
   door + unknown method still → `unknown_method`. Unmounted id
   (any door) still → `not_mounted`.
3. Known methods on mounted minis keep `.1079`–`.1095` envelopes.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected codes hardcoded in tests.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No fifth door.
No change to `unknown_method`, `scope_denied`, `not_mounted`,
`already_mounted`, `unknown_mini`, or `bad_deeplink`. No change
to dual-mount isolation (`.1092`–`.1095`). No change to
`listMounted`.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
