Superseded live LOG section rotated 2026-09-15 for `.1088` MiniHost.unmount not_mounted.

## 2026-09-14 — Health mini stub mount (`.1073`)

`health.mini` reserved at
`mission://minis/mini` (L1 first
mini, not `utility.*`). Manifest
scopes are the closed set
`identity.read` + `storage.read` +
`storage.write`. `mountHealthMini`
calls existing `MiniHost.mount` —
does not rewrite the bus. Unit
tests on in-memory fakes: identity
and storage work; photos and
billing return `scope_denied`
(not `photos_stub`). Not
`health.train`. No Health UI. No
photos. No billing. Isolation:
coach / store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** extra
photos/billing/`health.write`
scope fails the closed list;
photos deny code is
`scope_denied` not `photos_stub`;
helper cannot mount ClearShot or
Train by swapping the constant.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1073`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1056-for-1073.md](docs/archive/log/LOG-rotate-1056-for-1073.md) (`.1056`).
