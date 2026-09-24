Superseded live LOG section rotated 2026-09-24 for `.1112` History year of logged days.
`.1096` was already filed by `.1111`.

## 2026-09-15 — CapResult storage_cap / MiniHost write bound (`.1097`)

A scoped MiniHost storage
`set` that exceeds the
in-memory cap (32 keys /
4KB) returns one CapResult
deny: `{ ok: false, code:
'storage_cap' }` — not
`scope_denied` (unscoped,
`.1083`), not
`unknown_method` (`.1085`),
not `not_mounted`
(lifecycle, `.1089`). Does
not throw. Does not write
the overflowing key or
oversized value. Overwrite
of an existing key at 32
still succeeds. Exactly
4096 bytes still succeeds.
An unscoped huge `set`
stays `scope_denied`. An
unmounted id stays
`not_mounted` even when
the value would have
overflowed — lifecycle
first. Dual-mount isolation
(`.1092`) stays: A's cap
refuse does not wipe B.
Dual-mount `listMounted`
inventory was already
closed tightly by `.1081`.
No UI / Stripe / camera.
Isolation: coach / store /
HomePage / ActiveWorkout
stay blind.

**Mutants killed:** oversized
set collapsing to `ok`;
oversized set collapsing to
`scope_denied`; overflow
still writing the key; 33rd
key succeeding; overwrite at
32 becoming `storage_cap`;
unscoped huge set becoming
`storage_cap`; unmounted +
huge set becoming
`storage_cap` instead of
`not_mounted`; Health overflow
wiping granted keys; throw /
undefined instead of a
CapResult.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1097`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1082-for-1097.md](docs/archive/log/LOG-rotate-1082-for-1097.md) (`.1082`).
