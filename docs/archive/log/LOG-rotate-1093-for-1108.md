Superseded live LOG section rotated 2026-09-16 for `.1108` storage remount leftover old-fake writes.

## 2026-09-15 — Dual-mount CapResult identity isolation (`.1093`)

Two different minis mounted at
once with identity scope each
see only their own injected
snapshot via CapResult
`identity.read`. `A.read` is
A's envelope, not B's.
Injecting or overriding A's
snapshot does not change
`B.read`. Without identity
scope, `identity.read` stays
`scope_denied` (`.1082`) even
when a snapshot is injected
for that id. Storage isolation
(`.1092`) and prior CapResult
codes stay. Fake-only
`identities[id]` +
`injectIdentitySnapshot` —
no production auth. No UI.
No Stripe. No camera. No
Supabase. Isolation: coach /
store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** shared
host-wide snapshot object
(`alpha` becomes `bravo`);
inject A rewriting B.read;
mutating the injected Health
object leaking into granted;
unscoped `test.noidentity`
returning the injected
snapshot instead of
`scope_denied`; storage maps
collapsing while both live.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1093`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1078-for-1093.md](docs/archive/log/LOG-rotate-1078-for-1093.md) (`.1078`).

