Superseded live LOG section rotated 2026-09-16 for `.1109` leftover Health extras cannot grant billing.

## 2026-09-15 — Dual-mount CapResult billing isolation (`.1094`)

Two different minis mounted at
once with billing scope each
see only their own muted
snapshot via CapResult
`billing.read`. `A.read` is
A's envelope, not B's.
Injecting or mutating A's
snapshot does not change
`B.read`. Checkout / portal
stay the scoped `{ held: true }`
stub. Without billing scope,
every billing method stays
`scope_denied` (`.1079`) even
when a snapshot is injected
for that id. Identity
isolation (`.1093`) and
storage isolation (`.1092`)
stay. Fake-only `billings[id]`
+ `injectBillingSnapshot` —
no Stripe. No UI. No camera.
Isolation: coach / store /
HomePage / ActiveWorkout stay
blind.

**Mutants killed:** shared
host-wide muted snapshot
(`none` becomes `super`);
inject A rewriting B.read;
mutating the injected
test.billing object leaking
into granted; unscoped Health
/ ClearShot returning the
injected snapshot instead of
`scope_denied`; identity or
storage maps collapsing while
both live.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1094`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1079-for-1094.md](docs/archive/log/LOG-rotate-1079-for-1094.md) (`.1079`).
