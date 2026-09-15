Superseded live LOG section rotated 2026-09-15 for `.1101` deeplink remount already_mounted.

## 2026-09-15 — MiniHost already_mounted (`.1086`)

A second `MiniHost.mount` of an
id that is still mounted returns
the same CapResult deny shape as
the other host errors:
`{ ok: false, code:
'already_mounted' }` — not a
throw, not a silent replace of
the live instance. Manifest
validation stays first (`stub`).
Caller unmounts first (`.1078`);
remount after unmount cannot
read leftovers. `listMounted` is
one entry while mounted, zero
after unmount. No UI. No Stripe.
No camera. Isolation: coach /
store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** remount
returning `ok` or throwing;
replacing inventory scopes;
leftover storage surviving
unmount; `listMounted` growing a
second row; invalid remount
wiping the live instance.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1086`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1071-for-1086.md](docs/archive/log/LOG-rotate-1071-for-1086.md) (`.1071`).
