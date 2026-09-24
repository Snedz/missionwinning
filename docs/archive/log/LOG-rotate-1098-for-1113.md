Superseded live LOG section rotated 2026-09-24 for `.1113` History year of logged days.
`.1097` was already filed by `.1112`.

## 2026-09-15 — CapResult deny-code set freeze (`.1098`)

The CapResult host-lifecycle
deny set is now a closed list:
`scope_denied`,
`unknown_method`,
`unknown_capability`,
`not_mounted`,
`already_mounted`,
`unknown_mini`,
`bad_deeplink`,
`storage_cap`. A ninth code is
a PLAN hop, not a silent extra
string. Judge-owned hardcoded
list in tests; production
`CAPABILITY_DENY_CODES` /
`HOST_LIFECYCLE_DENY_CODES`
must match. Discover
production `code: '…'`
literals — a new spelling
fails; a stale allowlist
entry that never emits also
fails. Each of the eight is
emitted live on MiniHost.
Scoped stubs `stub` /
`photos_stub` stay in the
complete set. They are not
host-lifecycle and are not a
license for a tenth code.
Known envelopes stay
`.1079`–`.1097`. No UI /
Stripe / camera. Isolation:
coach / store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** a ninth
host-lifecycle code on the
production const; a production
`code: 'rate_limited'` literal;
host-lifecycle list drifting
from the hardcoded eight;
`storage_cap` collapsing to
`scope_denied`; freeze list
that never runs (no live
emit); PLAN.md omitting a
frozen code; HOP.md carrying
the claim.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1098`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1083-for-1098.md](docs/archive/log/LOG-rotate-1083-for-1098.md) (`.1083`).
