## 2026-09-15 — Deeplink remount already_mounted (`.1101`)

`resolveMiniDeeplink` of a known
URI is a lookup — it does not
mount. First `mountMiniByDeeplink`
of `mission://minis/health` or
`mission://minis/clearshot` is
`ok`. A second call of that same
live URI returns `{ ok: false,
code: 'already_mounted' }`. Does
not throw. Does not replace the
live instance. Does not wipe
keys written before the remount
attempt. `listMounted` stays one
row for that id. Health remount
does not touch live ClearShot.
After unmount, the same deeplink
remounts empty. `.1086` closed
direct `MiniHost.mount` remount.
`.1090` / `.1091` closed unknown
/ bad deeplink. Isolation: coach
/ store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** resolve
mounting as a side effect;
deeplink remount returning `ok`
or throwing; remount wiping
storage; remount replacing
inventory; Health remount
touching ClearShot; leftover
keys surviving unmount +
deeplink remount; HOP.md
carrying the claim.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1101`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1086-for-1101.md](docs/archive/log/LOG-rotate-1086-for-1101.md) (`.1086`).
