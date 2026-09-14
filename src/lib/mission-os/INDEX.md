# src/lib/mission-os/

> One concern: named TypeScript doors for the Mission OS capability bus. Pure deny/allow lives in `packages/mw-core/src/module/`. The function-style web adapter from #935 stays in [`src/lib/minis/`](../minis/INDEX.md).

## Agent resume card

- **Purpose:** `IdentityCapability`, `BillingCapability` (Stripe HOLD — interface only), `PhotosCapability`, `StorageCapability`, `MiniHost.mount(manifest)`, `CapResult`. In-memory / no-op doubles for tests.
- **Non-goals:** ClearShot product UI, Today/More door, `app/(app)/minis/`, camera, Stripe checkout, cloud photos, remake of Today.
- **Entry files:** `types.ts`, `host.ts`
- **Tests to run:** `src/lib/mission-os/host.test.ts`, `src/lib/minisIsolation.test.ts`
- **Forbidden:** Import from `src/lib/coach/`, `src/store/`, `HomePage`, `ActiveWorkoutPage`. Do not import Stripe, `premiumServer`, or `safeStorage`. Never gate `logSet`.
- **Horizon:** Interfaces + stubs. Host chrome later.

## Doors

| Door | Stub |
|------|------|
| identity | Injected `{ missionId, callSign }`. Guests are `null`. Never mint. |
| billing | Interface + muted hold. Never checkout. Never Stripe. |
| photos | Always `photos_stub` when scoped. |
| storage | In-memory map keyed by mini id. Cap 32 keys / 4KB (mw-core). |

`CapResult<T>` is `CapabilityResult<T>` from mw-core — one shape, two names.

## Related

| Path | Role |
|------|------|
| `packages/mw-core/src/module/` | Manifest + `assertCapability` (#935) |
| `src/lib/minis/` | Function bus (`createMiniBus`) |
| `docs/contracts/MODULE.md` | Contract |
| `src/lib/minisIsolation.test.ts` | Coach / logger / Today stay blind |
