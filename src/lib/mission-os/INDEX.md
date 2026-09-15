# src/lib/mission-os/

> One concern: named TypeScript doors for the Mission OS capability bus. Pure deny/allow lives in `packages/mw-core/src/module/`. The function-style web adapter from #935 stays in [`src/lib/minis/`](../minis/INDEX.md).

## Agent resume card

- **Purpose:** `IdentityCapability` (`read`), `BillingCapability` (Stripe HOLD — `read` / `checkout` / `portal`, interface only), `PhotosCapability` (`read` / `write`), `StorageCapability` (`get` / `set`), `MiniHost.mount(manifest)`, `MiniHost.unmount(id)`, `MiniHost.listMounted`, `MiniHost.call`, `callDoor` / `callMountedDoor`, `CapResult`. Named in-memory fakes (`createIdentityFake`, `createBillingFake`, `createPhotosFake`, `createStorageFake`). Health mini stub (`l1.health` at `mission://minis/health`, L1 first mini) mounts identity + storage only. ClearShot utility stub (`utility.clearshot` at `mission://minis/clearshot`) mounts photos + storage.write. Last-segment deeplink table (`health` / `clearshot`) resolves `mission://minis/{slug}` to the reserved mount. In-memory unmount clears that mini's fake keyspace (`.1078`). Billing CapResult deny is the same shape on every method when unscoped (`.1079`). Photos CapResult deny is the same shape on every method when unscoped; scoped stays `photos_stub` (`.1080`). `listMounted` is the CapResult inventory — mounted ids + declared scopes only; undeclared peek → `scope_denied`; never-mounted id → `unknown_mini` (`.1081`). Identity CapResult deny is the same shape on every method when unscoped; Health + ClearShot keep stub success (`.1082`). Storage CapResult deny is the same shape on every method when unscoped (`test.nostorage`, `test.billing`); Health keeps stub success; ClearShot `set` succeeds, `get` stays `scope_denied` (`.1083`). Allow-path consistency: when a mini declares billing / photos / identity / storage, granted methods return the existing stub envelopes (`.1084`). Unknown-method consistency: a name outside the closed set on a declared door is `unknown_method`; on an undeclared door the same name is `scope_denied` (deny-before-unknown, `.1085`). Duplicate mount of a still-mounted id is `already_mounted` — does not replace the live instance (`.1086`). Unknown id on `MiniHost.mount` is `unknown_mini` — does not throw, does not create a partial mount (`.1087`). Unmount of an id that is not currently mounted is `not_mounted` — does not throw; live unmount still clears storage (`.1088`). Capability call for an id that is not currently mounted is `not_mounted` — does not throw, does not auto-mount; mounted minis keep `.1079`–`.1087` envelopes (`.1089`).
- **Non-goals:** ClearShot product UI, Today/More door, `app/(app)/minis/`, camera, Stripe checkout, cloud photos, remake of Today, ClearShot inside the MW APK, Health product UI, auth UI, Supabase.
- **Entry files:** `types.ts`, `fakes.ts`, `host.ts` (`HOST_MOUNT_ALLOWLIST` / `isKnownMountId`), `health.ts`, `clearshot.ts`, `deeplink.ts`, `call.ts`, `billingProbe.ts` (test-only), `identityProbe.ts` (test-only), `storageProbe.ts` (test-only), `allowProbe.ts` (test-only)
- **Tests to run:** `src/lib/mission-os/fakes.test.ts`, `src/lib/mission-os/host.test.ts`, `src/lib/mission-os/health.test.ts`, `src/lib/mission-os/clearshot.test.ts`, `src/lib/mission-os/mountIsolation.test.ts`, `src/lib/mission-os/deeplink.test.ts`, `src/lib/mission-os/billing.test.ts`, `src/lib/mission-os/photos.test.ts`, `src/lib/mission-os/listMounted.test.ts`, `src/lib/mission-os/identity.test.ts`, `src/lib/mission-os/storage.test.ts`, `src/lib/mission-os/allow.test.ts`, `src/lib/mission-os/call.test.ts`, `src/lib/mission-os/alreadyMounted.test.ts`, `src/lib/mission-os/unknownMini.test.ts`, `src/lib/mission-os/notMounted.test.ts`, `src/lib/mission-os/callNotMounted.test.ts`, `src/lib/minisIsolation.test.ts`
- **Forbidden:** Import from `src/lib/coach/`, `src/store/`, `HomePage`, `ActiveWorkoutPage`. Do not import Stripe, `premiumServer`, or `safeStorage`. Never gate `logSet`.
- **Horizon:** Interfaces + stubs. Host chrome later.

## Doors

| Door | Stub |
|------|------|
| identity | `createIdentityFake`. Closed method `read`. Unscoped → `scope_denied`. Scoped → injected `{ missionId, callSign }` (guests `null`). Unknown name on a declared door → `unknown_method`. Never mint. Never auth UI. |
| billing | `createBillingFake` / `createBillingHold`. Closed methods `read` / `checkout` / `portal`. Unscoped → `scope_denied`. Scoped → muted read + `{ held: true }` stub. Unknown name on a declared door → `unknown_method`. Never Stripe. |
| photos | `createPhotosFake`. Closed methods `read` / `write`. Unscoped → `scope_denied`. Scoped → `photos_stub`. Unknown name on a declared door → `unknown_method`. Never camera. Never MediaStore. |
| storage | `createStorageFake`. Closed methods `get` / `set`. Unscoped → `scope_denied` (does not write). Health (read + write) stub success. ClearShot write stub success; read stays `scope_denied`. Unknown name on a declared door → `unknown_method` (does not write). Cap 32 keys / 4KB (mw-core). `MiniHost.unmount(id)` clears that map so remount cannot read leftovers. |

`CapResult<T>` is `CapabilityResult<T>` from mw-core — one shape, two names.

Reserved Health stub: `HEALTH_MINI_MANIFEST` / `mountHealthMini` — scopes `identity.read`, `storage.read`, `storage.write`. Photos and billing stay `scope_denied`. Not `health.train`.

Reserved ClearShot stub: `CLEARSHOT_MINI_MANIFEST` / `mountClearShotMini` — reuses `UTILITY_CLEARSHOT_MANIFEST`. Scopes `identity.read`, `photos.read`, `photos.write`, `storage.write`. Photos stay `photos_stub`. Billing, `storage.read`, and `health.write` stay `scope_denied`. Not `l1.health`. Not `health.train`.

Last-segment deeplink: `resolveMiniDeeplink` / `mountMiniByDeeplink` — closed table `health` → `l1.health`, `clearshot` → `utility.clearshot`. Long opaque paths (`mission://minis/utility.clearshot`) are `unknown_mini`.

Test-only billing probe: `TEST_BILLING_MANIFEST` / `mountTestBillingMini` (`test.billing` at `mission://minis/billing`). Not a product mount. Not in the deeplink table. Not in `MINI_REGISTRY`. Grants `billing.read` so the stub success path can be asserted.

Test-only identity deny probe: `TEST_NO_IDENTITY_MANIFEST` / `mountTestNoIdentityMini` (`test.noidentity` at `mission://minis/noidentity`). Not a product mount. Not in the deeplink table. Not in `MINI_REGISTRY`. Scopes `storage.write` only — no `identity.read` — so identity methods can be asserted as `scope_denied`.

Test-only no-storage probe: `TEST_NO_STORAGE_MANIFEST` / `mountTestNoStorageMini` (`test.nostorage` at `mission://minis/nostorage`). Not a product mount. Not in the deeplink table. Not in `MINI_REGISTRY`. Declares `identity.read` only so every storage method is `scope_denied`.

Test-only allow-path probe: `TEST_GRANTED_MANIFEST` / `mountTestGrantedMini` (`test.granted` at `mission://minis/granted`). Not a product mount. Not in the deeplink table. Not in `MINI_REGISTRY`. Declares identity + billing + photos + storage so granted stub envelopes can be asserted together.

## Related

| Path | Role |
|------|------|
| `packages/mw-core/src/module/` | Manifest + `assertCapability` (#935) |
| `src/lib/minis/` | Function bus (`createMiniBus`) |
| `docs/contracts/MODULE.md` | Contract |
| `src/lib/minisIsolation.test.ts` | Coach / logger / Today stay blind |
| `mountIsolation.test.ts` | Health + ClearShot mount grant/deny + storage keyspace (`.1076`) + unmount/remount leftovers (`.1078`) |
| `billing.test.ts` | Billing CapResult deny consistency + test-only grant (`.1079`) |
| `photos.test.ts` | Photos CapResult deny consistency — Health `scope_denied`, ClearShot `photos_stub` (`.1080`) |
| `listMounted.test.ts` | MiniHost.listMounted CapResult inventory — declared scopes only; undeclared peek `scope_denied`; never-mounted `unknown_mini` (`.1081`) |
| `identity.test.ts` | Identity CapResult deny consistency — test-only `test.noidentity` `scope_denied`; Health + ClearShot stub success (`.1082`) |
| `storage.test.ts` | Storage CapResult deny consistency — unscoped `scope_denied` (no write); Health stub success; ClearShot write-only (`.1083`) |
| `allow.test.ts` | CapResult allow-path consistency — test-only `test.granted` returns existing stub envelopes on every declared door (`.1084`) |
| `call.test.ts` | CapResult unknown-method consistency — declared door + unknown name is `unknown_method`; undeclared door stays `scope_denied` (`.1085`) |
| `alreadyMounted.test.ts` | MiniHost.mount refuses a second mount of the same id while mounted — `already_mounted` (`.1086`) |
| `unknownMini.test.ts` | MiniHost.mount refuses an id outside the host allowlist — `unknown_mini` (`.1087`) |
| `notMounted.test.ts` | MiniHost.unmount refuses an id that is not currently mounted — `not_mounted` (`.1088`) |
| `callNotMounted.test.ts` | Capability call for an id that is not currently mounted — `not_mounted` (`.1089`) |
| `PLAN.md` | `.1089` CapResult call when mini not mounted claim |
| `call.ts` | String-dispatch `callDoor` — deny-before-unknown, then closed-method check. `callMountedDoor` refuses a missing id with `not_mounted` |
| `deeplink.ts` | Last-segment `clearshot` → `utility.clearshot` mount |
| `billingProbe.ts` | Test-only `test.billing` — not a product mount |
| `identityProbe.ts` | Test-only `test.noidentity` — not a product mount |
| `storageProbe.ts` | Test-only `test.nostorage` — not a product mount |
| `allowProbe.ts` | Test-only `test.granted` — not a product mount |
