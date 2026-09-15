# Contract: Module host (mini-app)

**Version:** 1.0.0  
**Status:** Spec + types + capability-bus stubs — host chrome is later  
**Horizon:** Types + stubs now; athlete-facing mini host Horizon 3+ / platform era

---

## Purpose

Describe every product surface as a **module** with an id, version, scopes, and free-core flag — so health can later run as a mini-app inside Mission OS, and games can bind the same Mission ID without a second account system.

## Manifest shape

```yaml
module:
  id: health.train          # reverse-dns style
  version: 1.0.0
  scopes:
    - identity.read
    - health.write
    - economy.earn
  surfaces: [web, android]
  free_core: true
  entry: /active            # host path, or mission://minis/{slug} for utility minis
```

## Registered module ids (current product)

| Id | Role | Free core |
|----|------|-----------|
| `health.train` | Logger + victory | yes |
| `health.coach` | Weekly plan engine | free generate; depth premium |
| `health.fuel` | Nutrition | free basics |
| `health.move` | Mobility | free basics |
| `health.mind` | Mind / recovery | free basics |
| `health.track` | Progress / activity | free basics |
| `health.learn` | Education | free foundations |
| `id.profile` | Athlete Page | yes |
| `id.account` | Settings | yes |
| `economy.rewards` | Local XP / badges | yes |
| `social.server` | Garage messenger (rooms + local presence) | **yes** (`free_core: true` — garage itself is not a paywall) |
| `utility.clearshot` | First utility mini (ClearShot). Entry `mission://minis/clearshot` (last-segment `clearshot`). Reserved — no product UI this ship. Scopes: `identity.read`, `photos.read`, `photos.write`, `storage.write`. Never `health.write`. Never `billing.read`. `storage.read` fail-closed. Mount helper: `src/lib/mission-os/clearshot.ts`. | **yes** |
| `l1.health` | L1 first Health mini stub. Entry `mission://minis/health`. Reserved — no product UI this ship. Scopes: `identity.read`, `storage.read`, `storage.write`. Never photos, billing, or `health.write`. Not `utility.*` (ClearShot stays that family). Not `health.train`. Not `health.mini` (opaque last-segment `mini`). Mount helper: `src/lib/mission-os/health.ts`. | **yes** |
| `game.*` | Future in-ecosystem games (Age of Empires 2 / Pokémon GO / Clash of Clans analogues) bind the same Mission ID — host runtime is post-PMF; **no UI in this horizon** | reserved |
| `host.shell` | Future mini-host. Runtime note: reserved id only (`HOST_SHELL` / `HOST_SHELL_ID`). Not a `ModuleManifest` — no fake `/` entry. | n/a |

## Scopes

| Scope | Allows |
|-------|--------|
| `identity.read` | Read public Mission ID / card cosmetics. Named fake method `read` returns `CapResult` — unscoped is `scope_denied`; scoped is the injected snapshot (guests `null` / `null`). Two live mounts keep isolated snapshots — A's read is not B's; injecting A does not change B (`.1093`). Never mint. Never auth UI. Never Supabase. |
| `identity.write` | Change call sign / card picks (local) |
| `health.read` | Read workouts / logs (user-owned) |
| `health.write` | Append logs |
| `economy.earn` | Emit earn events from allowed sources |
| `economy.read` | Read own points/inventory |
| `social.project` | Publish allowed projection fields only |
| `social.channel.write` | Append a text message in a room the athlete already belongs to. Local always; signed-in persist to `social_messages` |
| `photos.read` | Read on-device photos. Named fake methods `read` / `write` all return `CapResult` — unscoped is `scope_denied`; scoped is `photos_stub`. Never camera. Never MediaStore. |
| `photos.write` | Write on-device photos. Same CapResult shape as `photos.read`. |
| `storage.read` | Read mini-scoped key-value (capped). Named fake methods `get` / `set` all return `CapResult` — unscoped is `scope_denied` and does not write. Health (declares read + write) is stub success. ClearShot does not declare this scope, so `get` stays `scope_denied`. Two live mounts keep isolated maps — set on A is invisible to get on B (`.1092`). |
| `storage.write` | Write mini-scoped key-value (capped). Same CapResult shape as `storage.read`. Health and ClearShot stub-succeed. Unscoped deny does not write the map. Unmount A does not wipe B's keys (`.1092`). |
| `billing.read` | Read Super Bundle recognition (`none` / `super`). Always muted. Named fake methods `read` / `checkout` / `portal` all return `CapResult` — unscoped is `scope_denied`; scoped checkout/portal are a `{ held: true }` stub. Two live mounts keep isolated muted snapshots — A's read is not B's; injecting A does not change B (`.1094`). Never Stripe. Never gates `logSet`. |

Host **denies** undeclared scopes (`scope_denied`). Unknown mini id → `unknown_mini`. `MiniHost.mount` of an id outside the closed host allowlist is `unknown_mini` (does not throw, does not create a partial mount). A second `MiniHost.mount` of an id that is still mounted is `already_mounted` (does not replace the live instance; unmount first). `MiniHost.unmount` of an id that is not currently mounted is `not_mounted` (does not throw; live unmount still clears that mini's fake keyspace). A capability call (`MiniHost.call` / `callMountedDoor`) for an id that is not currently mounted is `not_mounted` (does not throw, does not auto-mount; mounted ids keep `.1079`–`.1087` envelopes). A method name outside the closed set on a **declared** door is `unknown_method` (`callDoor`). The same unknown name on an undeclared door stays `scope_denied` (deny-before-unknown). A capability *door* name outside the closed set (`identity` / `billing` / `photos` / `storage`) is `unknown_capability` — not `scope_denied`, not `unknown_method`; an unmounted id stays `not_mounted` even when the door is also unknown. Host-lifecycle CapResult deny codes are frozen (`.1098`): `scope_denied`, `unknown_method`, `unknown_capability`, `not_mounted`, `already_mounted`, `unknown_mini`, `bad_deeplink`, `storage_cap` — no silent new code without PLAN. `health.train` stays `free_core: true`; a mini cannot override that. Capability bus: `packages/mw-core/src/module/capabilities.ts`. Function web stubs: `src/lib/minis/` (#935). Named doors: `src/lib/mission-os/` (`IdentityCapability` — `read`, `BillingCapability` Stripe HOLD — `read` / `checkout` / `portal`, `PhotosCapability` — `read` / `write`, `StorageCapability` — `get` / `set`, `MiniHost.mount`, `MiniHost.unmount`, `MiniHost.listMounted`, `MiniHost.call`, `CapResult`). In-memory fakes: `createIdentityFake`, `createBillingFake`, `createPhotosFake`, `createStorageFake`. Health stub: `HEALTH_MINI_MANIFEST` / `mountHealthMini` (identity + storage only; photos `scope_denied` on every method; identity stub success). ClearShot stub: `CLEARSHOT_MINI_MANIFEST` / `mountClearShotMini` (photos + storage.write; photos stay `photos_stub` on every method; billing `scope_denied` on every method; identity stub success). Last-segment deeplink: `resolveMiniDeeplink` / `mountMiniByDeeplink` (`src/lib/mission-os/deeplink.ts`) — `mission://minis/clearshot` → `utility.clearshot`; `mission://minis/health` → `l1.health`. A well-formed unknown last-segment (`mission://minis/totally-unknown`) is `unknown_mini` (same code as mount `.1087`; does not throw, does not mount). Empty string, wrong scheme, `mission://other/…`, and `mission://minis` with no last-segment are `bad_deeplink` (does not throw, does not mount). In-memory `unmount(id)` clears that mini's fake keyspace so remount cannot read leftovers. `listMounted` is the CapResult inventory — mounted ids + declared scopes only; undeclared peek → `scope_denied`; never-mounted id → `unknown_mini`. Test-only billing grant: `TEST_BILLING_MANIFEST` / `mountTestBillingMini` (`test.billing`) — not a product mount, not in the deeplink table. Test-only identity deny: `TEST_NO_IDENTITY_MANIFEST` / `mountTestNoIdentityMini` (`test.noidentity`) — not a product mount, not in the deeplink table. Storage CapResult deny: unscoped `get` / `set` are `scope_denied` and do not write (`test.nostorage`, also `test.billing`); Health keeps stub success; ClearShot `set` succeeds, `get` stays `scope_denied`. Test-only no-storage probe: `TEST_NO_STORAGE_MANIFEST` / `mountTestNoStorageMini` (`test.nostorage`) — not a product mount, not in the deeplink table.

## Types

`@missionwinning/mw-core` → `module` (`ModuleManifest`, `ModuleScope`, `parseModuleId`, `assertCapability`, `UTILITY_CLEARSHOT_MANIFEST`, `HOST_SHELL`, `listMountedInventory` / `peekMountedInventory` / `peekMountedScope`). Named host doors: `src/lib/mission-os/` (`MiniHost.mount`, `MiniHost.unmount`, `MiniHost.listMounted`, `MiniHost.call`, `callDoor`, `callMountedDoor`, `CapResult`, in-memory fakes, `HEALTH_MINI_MANIFEST` / `mountHealthMini`, `CLEARSHOT_MINI_MANIFEST` / `mountClearShotMini`, `resolveMiniDeeplink` / `mountMiniByDeeplink`, `HOST_MOUNT_ALLOWLIST` / `isKnownMountId`, billing methods `read` / `checkout` / `portal`, photos methods `read` / `write`, identity method `read`, storage methods `get` / `set`, test-only `TEST_BILLING_MANIFEST`, test-only `TEST_NO_IDENTITY_MANIFEST`, test-only `TEST_NO_STORAGE_MANIFEST`, test-only `TEST_GRANTED_MANIFEST`).

## Agent resume

- New domains: add a row here + optional manifest constant in mw-core  
- Do not invent a second user id per module  
- Games must declare `economy.earn` sources that map to allowlisted event kinds
