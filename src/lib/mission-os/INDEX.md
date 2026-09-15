# src/lib/mission-os/

> One concern: named TypeScript doors for the Mission OS capability bus. Pure deny/allow lives in `packages/mw-core/src/module/`. The function-style web adapter from #935 stays in [`src/lib/minis/`](../minis/INDEX.md).

## Agent resume card

- **Purpose:** `IdentityCapability`, `BillingCapability` (Stripe HOLD — interface only), `PhotosCapability`, `StorageCapability`, `MiniHost.mount(manifest)`, `CapResult`. Named in-memory fakes (`createIdentityFake`, `createBillingFake`, `createPhotosFake`, `createStorageFake`). Health mini stub (`l1.health` at `mission://minis/health`, L1 first mini) mounts identity + storage only. ClearShot utility stub (`utility.clearshot` at `mission://minis/clearshot`) mounts photos + storage.write. Last-segment deeplink table (`health` / `clearshot`) resolves `mission://minis/{slug}` to the reserved mount.
- **Non-goals:** ClearShot product UI, Today/More door, `app/(app)/minis/`, camera, Stripe checkout, cloud photos, remake of Today, ClearShot inside the MW APK, Health product UI.
- **Entry files:** `types.ts`, `fakes.ts`, `host.ts`, `health.ts`, `clearshot.ts`, `deeplink.ts`
- **Tests to run:** `src/lib/mission-os/fakes.test.ts`, `src/lib/mission-os/host.test.ts`, `src/lib/mission-os/health.test.ts`, `src/lib/mission-os/clearshot.test.ts`, `src/lib/mission-os/mountIsolation.test.ts`, `src/lib/mission-os/deeplink.test.ts`, `src/lib/minisIsolation.test.ts`
- **Forbidden:** Import from `src/lib/coach/`, `src/store/`, `HomePage`, `ActiveWorkoutPage`. Do not import Stripe, `premiumServer`, or `safeStorage`. Never gate `logSet`.
- **Horizon:** Interfaces + stubs. Host chrome later.

## Doors

| Door | Stub |
|------|------|
| identity | `createIdentityFake` — injected `{ missionId, callSign }`. Guests are `null`. Never mint. |
| billing | `createBillingFake` / `createBillingHold`. Always muted. Never checkout. Never Stripe. |
| photos | `createPhotosFake` — always `photos_stub` when scoped. |
| storage | `createStorageFake` — in-memory map keyed by mini id. Cap 32 keys / 4KB (mw-core). |

`CapResult<T>` is `CapabilityResult<T>` from mw-core — one shape, two names.

Reserved Health stub: `HEALTH_MINI_MANIFEST` / `mountHealthMini` — scopes `identity.read`, `storage.read`, `storage.write`. Photos and billing stay `scope_denied`. Not `health.train`.

Reserved ClearShot stub: `CLEARSHOT_MINI_MANIFEST` / `mountClearShotMini` — reuses `UTILITY_CLEARSHOT_MANIFEST`. Scopes `identity.read`, `photos.read`, `photos.write`, `storage.write`. Photos stay `photos_stub`. Billing, `storage.read`, and `health.write` stay `scope_denied`. Not `l1.health`. Not `health.train`.

Last-segment deeplink: `resolveMiniDeeplink` / `mountMiniByDeeplink` — closed table `health` → `l1.health`, `clearshot` → `utility.clearshot`. Long opaque paths (`mission://minis/utility.clearshot`) are `unknown_mini`.

## Related

| Path | Role |
|------|------|
| `packages/mw-core/src/module/` | Manifest + `assertCapability` (#935) |
| `src/lib/minis/` | Function bus (`createMiniBus`) |
| `docs/contracts/MODULE.md` | Contract |
| `src/lib/minisIsolation.test.ts` | Coach / logger / Today stay blind |
| `mountIsolation.test.ts` | Health + ClearShot mount grant/deny + storage keyspace (`.1076`) |
| `PLAN.md` | `.1078` MiniHost unmount/remount isolation claim |
| `deeplink.ts` | Last-segment `clearshot` → `utility.clearshot` mount |
