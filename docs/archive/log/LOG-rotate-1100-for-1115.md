# LOG rotate — `.1100` for `.1115`

Rotated out of `LOG.md` on 2026-09-24 so the live log stays within 15 entries after `.1115`.

## 2026-09-15 — CapResult storage.remove consistency (`.1100`)

`storage.remove` is the third
closed storage method. Scoped
write returns `{ ok: true,
value: undefined }` — deletes
the key or is a no-op miss.
A following get is a miss.
Occupancy drops: after a
32-key fill the 33rd set is
still `storage_cap`; remove
one; the next in-bound set is
`ok`. Unscoped remove is
`scope_denied` and does not
delete a seeded key.
Unmounted `host.call` remove
is `not_mounted`. `clear` /
`delete` stay
`unknown_method`. A.remove
does not delete B. No ninth
deny code. `.1083` closed
get/set deny. `.1085` left
`storage.clear` unknown.
`.1098` / `.1099` named this
method and left it open.
Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** remove
routing to set (occupancy
stays); unscoped remove
deleting a seeded key;
declared `clear` / `delete`
becoming known; unmounted
remove auto-mounting; A.remove
wiping B; remove after cap
leaving occupancy; HOP.md
carrying the claim.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1100`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1085-for-1100.md](docs/archive/log/LOG-rotate-1085-for-1100.md) (`.1085`).
