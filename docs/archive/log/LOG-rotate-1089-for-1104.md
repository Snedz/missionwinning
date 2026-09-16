Superseded live LOG section rotated 2026-09-16 for `.1104` opaque Postgres errors in admin helpers.

## 2026-09-15 — CapResult call not_mounted (`.1089`)

Dispatching a capability call
(identity / billing / photos /
storage) for a mini id that is
not currently mounted returns
the same CapResult deny shape as
unmount-not-mounted (`.1088`):
`{ ok: false, code:
'not_mounted' }` — not a throw,
not an auto-mount, not
`unknown_mini` (that code stays
mount / peek). After no mounts
or after unmount, `identity.read`
/ `storage.get` / etc. refuse.
Mounted minis keep `.1079`–`.1087`
envelopes. `unknown_mini`
(`.1087`), `already_mounted`
(`.1086`), and unmount
`not_mounted` stay unchanged.
No UI. No Stripe. No camera.
Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** never-mounted
call returning `ok` or throwing;
never-mounted call reusing
`unknown_mini` or `scope_denied`;
call auto-mounting the id;
call after unmount returning
the old envelope; a live sibling
making an unmounted id callable;
`unknown_mini` / `already_mounted`
/ unmount `not_mounted`
regressing.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1089`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1074-for-1089.md](docs/archive/log/LOG-rotate-1074-for-1089.md) (`.1074`).
