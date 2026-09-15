Superseded live LOG section rotated 2026-09-15 for `.1102` identity remount after inject.

## 2026-09-15 — MiniHost unknown_mini refuse (`.1087`)

`MiniHost.mount` of an id that
is not in the closed host
allowlist returns the same
CapResult deny shape as
never-mounted peek / unmount:
`{ ok: false, code:
'unknown_mini' }` — not a
throw, not a silent invented
mini, not a partial
`listMounted` row. Manifest
validation stays first (`stub`).
`already_mounted` (`.1086`) and
unmount isolation (`.1078`) stay
unchanged for known ids.
`mount('totally.unknown')` and a
valid-looking unknown manifest
both refuse. Known test minis
still mount. No UI. No Stripe.
No camera. Isolation: coach /
store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** unknown
mount returning `ok` or
throwing; listing the unknown
id; leftover store after a
failed unknown; valid unknown
manifest silently mounting;
invalid unknown flipping off
`stub`; `already_mounted` /
unmount leftovers regressing.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1087`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1072-for-1087.md](docs/archive/log/LOG-rotate-1072-for-1087.md) (`.1072`).
