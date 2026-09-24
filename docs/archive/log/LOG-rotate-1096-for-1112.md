Superseded live LOG section rotated 2026-09-24 for `.1112` workout CSV into local History.

## 2026-09-15 — CapResult unknown_capability / closed door set (`.1096`)

A capability door name outside
the closed set (`identity` /
`billing` / `photos` /
`storage`) returns one
CapResult deny:
`{ ok: false, code:
'unknown_capability' }` — not
`scope_denied` (undeclared
known door), not
`unknown_method` (known door,
unknown method, `.1085`), not
`not_mounted` (lifecycle,
`.1089`). Does not throw.
Does not dispatch. Does not
write storage. An unmounted
id stays `not_mounted` even
when the door name is also
unknown — lifecycle first.
`camera` / `health` /
`location` / `foo` / empty
string / `identity.read` all
refuse the same way. Known
doors keep `.1079`–`.1095`
envelopes. No fifth door. No
UI / Stripe / camera.
Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** unknown
door collapsing to
`scope_denied`; unknown door
collapsing to
`unknown_method`; unmounted +
unknown door returning
`unknown_capability` instead
of `not_mounted`; empty
string or `identity.read`
treated as a known door;
unknown door writing the
storage map; throw / undefined
instead of a CapResult.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1096`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1081-for-1096.md](docs/archive/log/LOG-rotate-1081-for-1096.md) (`.1081`).
