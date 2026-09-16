Superseded live LOG section rotated 2026-09-16 for `.1107` photos remount after inject.

## 2026-09-15 — Dual-mount CapResult storage isolation (`.1092`)

Two different minis mounted at
once keep isolated storage
keyspaces on the in-memory host.
`A.set(k, v)` then `B.get(k)` is
a miss / `scope_denied` per the
existing storage stub — not A's
value. Unmount A does not wipe
B's keys; remount A starts empty
(`.1078`). `listMounted` includes
both ids while both live. Known
method envelopes stay
`.1079`–`.1091`. Accept pairs:
`l1.health` + `test.granted`
(both declare storage) and
Health + ClearShot (ClearShot
`get` stays `scope_denied`).
No UI. No Stripe. No camera.
Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** shared
last-write-wins map (`health-only`
becomes `granted-only`); unmount
A wiping B; remount A reading
leftovers; `listMounted` listing
only one id; `stores.clear()`
wiping every mount; known
envelopes flipping while both
live.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1092`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1077-for-1092.md](docs/archive/log/LOG-rotate-1077-for-1092.md) (`.1077`).
