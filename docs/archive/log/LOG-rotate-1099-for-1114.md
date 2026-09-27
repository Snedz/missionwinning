Superseded live LOG section rotated 2026-09-24 for `.1114` Resume last chip and Victory vs-last.
`.1098` was already filed by `.1113`.

## 2026-09-15 — Remount after storage_cap (`.1099`)

After mini A hits CapResult
`storage_cap` on a scoped
`storage.set` (33rd key or a
value over 4KB), unmount then
remount A starts empty. Prior
keys miss. The first in-bound
write after remount is `ok` —
overflow occupancy does not
survive teardown. B's
keyspace is untouched through
A's cap, unmount, and remount.
The bound stays 32 keys /
4KB; remount does not lift it.
No leftover overflow state.
No ninth deny code. No
`storage.remove`. `.1092`
closed remount-empty after a
successful write; `.1097`
closed the refuse while both
still live; `.1098` named this
composition and left it open.
Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** remount
reusing the 32-key map (first
new write is still
`storage_cap`); remount
reading leftover keys from
before the refuse; unmount A
after cap wiping B; remount
after oversized still holding
the prior valid key; a ninth
`leftover_overflow` code;
HOP.md carrying the claim.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1099`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1084-for-1099.md](docs/archive/log/LOG-rotate-1084-for-1099.md) (`.1084`).
