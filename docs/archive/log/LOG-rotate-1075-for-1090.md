Superseded live LOG section rotated 2026-09-15 for `.1090` deeplink unknown last-segment.

## 2026-09-14 — ClearShot utility mini stub (`.1075`)

`utility.clearshot` mounts on
existing MiniHost + bus fakes
via `mountClearShotMini`,
mirroring Health `l1.health`
but as the utility lane.
Id last-segment is `clearshot`,
so entry is
`mission://minis/clearshot`.
Reuses reserved
`UTILITY_CLEARSHOT_MANIFEST`
(one home). Closed scopes:
`identity.read` (optional —
guests stay null),
`photos.read`, `photos.write`,
`storage.write`. Photos stay
`photos_stub`. Billing,
`storage.read`, and
`health.write` deny
`scope_denied`. Not
`l1.health`. Not
`health.train`. No ClearShot
UI. No Stripe. No ClearShot
Android code in MW.
Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** extra
`billing.read` / `health.write`
/ `storage.read` die on the
closed set; mounting Health or
Train from `clearshot.ts` dies;
`mission://minis/health` on the
utility id fails last-segment
match; scoped photos returning
success (not `photos_stub`)
dies; billing `photos_stub`
instead of `scope_denied` dies.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1075`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1058-for-1075.md](LOG-rotate-1058-for-1075.md) (`.1058`).
