# Paper .1091 — Deeplink malformed / non-minis URI refuse

ONE hop. Stubs stay stubby — no UI, no Stripe, no camera, no tip-promote.
ClearShot Android cash stays Next ONE. `PRIVATE_MODE` stays. No
`mission-ops/` in this public repo. `docs/harness/HOP.md` stays the empty
template — the claim lives only here.

## Goal

Close the resolve hole `.1090` left open: a URI that is not a
well-formed `mission://minis/<segment>` must refuse with a distinct
CapResult code. Empty string, wrong scheme, wrong host path, and
`mission://minis` with no last-segment are not "unknown minis" — they
are not minis URIs at all. Does not throw. Does not mount. Well-formed
`mission://minis/<unknown>` stays `unknown_mini` (`.1090`). Known
`health` / `clearshot` keep current mount behavior.

## Claim

`resolveMiniDeeplink` (and `mountMiniByDeeplink`, which forwards it)
rejects malformed / wrong-scheme / non-`mission://minis/...` URIs with
CapResult `{ ok: false, code: 'bad_deeplink' }`. One consistent code,
hardcoded in tests. Does not throw. Does not mount.

`unknown_mini` (`.1090`) stays for a well-formed
`mission://minis/<segment>` whose last-segment is not in the closed
deeplink table (accept: `mission://minis/totally-unknown`). It is not
`not_mounted` (lifecycle, `.1088` / `.1089`) and not
`already_mounted` (second mount while live, `.1086`).

Shape gate is prefix + one non-empty last-segment
(`mission://minis/<segment>`, no extra `/`). It is not
`parseMissionMiniEntry`'s slug charset — a hyphenated last-segment is
still a well-formed minis URI, so `totally-unknown` stays
`unknown_mini`. `resolveMiniByLastSegment` stays a slug lookup
(`unknown_mini` on a table miss).

## Accept

1. Empty string, `https://evil`, `mission://other/x`,
   `mission://minis` (no segment) → `{ ok: false, code: 'bad_deeplink' }`
   hardcoded. Does not throw. Does not mount (`listMounted` stays empty).
2. `mission://minis/totally-unknown` still → `unknown_mini`.
3. `mission://minis/health` / `mission://minis/clearshot` still mount.
4. Unit tests under `src/lib/mission-os/`; judge ≠ builder —
   expected codes hardcoded in tests.
5. `docs/harness/HOP.md` stays the empty template.

## Non-goals

No product UI. No Today / Train door. No Stripe. No camera.
No MediaStore. No Supabase. No `PRIVATE_MODE` flip. No tip-promote.
Live www stays `.697`. ClearShot Android cash stays Next ONE.
No new product mini. No Android product work. No third deeplink
slug. No change to `unknown_mini` on a well-formed last-segment miss,
mount, or peek. No change to `already_mounted`. No change to unmount /
call `not_mounted`. No change to `parseMissionMiniEntry` charset.

## Refuse

No Stripe / camera / MediaStore / Supabase. No tip-promote. No
`PRIVATE_MODE` flip. No live `.697` change. No new product mini.
No Android product work.
