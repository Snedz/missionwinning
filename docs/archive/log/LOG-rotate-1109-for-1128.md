## 2026-09-16 — Leftover Health extras cannot grant billing (`.1109`)

Bind copies + freezes declared
scopes. Reserved Health scopes
are pinned at bind. Leftover
extras on a Health-shaped
document cannot grant
`billing.read` / checkout /
portal — first-mount extras,
live push on the passed
document, leftover push on
the bound manifest, and
remount of the mutated
object all stay
`scope_denied`. Granted
sibling stays. After
`storage_cap` + extras +
remount, billing is still
denied. `listMounted` peek of
billing stays `scope_denied`.
`.1094` closed live billing
isolation. `.1103` closed
billing remount leftover
inject. `.1108` closed leftover
storage writes. Isolation:
coach / store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** first-mount
extras granting billing or
throwing; leftover push on
the passed document granting
live billing; leftover push
on the bound manifest
granting; remount of the
mutated extras document
granting; remount rewriting
Granted.read; cap leftover
granting remounted billing;
listMounted peek listing
leftover extras; HOP.md
carrying the claim.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1109`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1094-for-1109.md](docs/archive/log/LOG-rotate-1094-for-1109.md) (`.1094`).
