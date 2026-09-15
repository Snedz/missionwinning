Superseded live LOG section rotated 2026-09-15 for `.1087` MiniHost unknown_mini refuse.

## 2026-09-14 — Mission OS capability interfaces (`.1072`)

Named host doors under
`src/lib/mission-os/`:
`IdentityCapability`,
`BillingCapability` (Stripe HOLD —
interface only), `PhotosCapability`,
`StorageCapability`,
`MiniHost.mount(manifest)`,
`CapResult` (alias of mw-core
`CapabilityResult`). Named
in-memory fakes:
`createIdentityFake`,
`createBillingFake` (Stripe HOLD —
always muted, no Stripe I/O),
`createPhotosFake`,
`createStorageFake`. Happy-path
`MiniHost.mount` unit tests on a
fully-scoped probe. Continues #935 /
`.1068` function bus — does not
replace it. No ClearShot UI. No
remake of Today. No ClearShot
inside the MW APK. Isolation:
coach / store / HomePage /
ActiveWorkout stay blind.

**Mutants killed:** `/active`
entry on ClearShot cannot mount;
a coach import of
`@/lib/mission-os` dies; billing
fake with `muted: false` still
reports muted.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1072`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1055-for-1072.md](docs/archive/log/LOG-rotate-1055-for-1072.md) (`.1055`).
