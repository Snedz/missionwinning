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
| `identity.read` | Read public Mission ID / card cosmetics |
| `identity.write` | Change call sign / card picks (local) |
| `health.read` | Read workouts / logs (user-owned) |
| `health.write` | Append logs |
| `economy.earn` | Emit earn events from allowed sources |
| `economy.read` | Read own points/inventory |
| `social.project` | Publish allowed projection fields only |
| `social.channel.write` | Append a text message in a room the athlete already belongs to. Local always; signed-in persist to `social_messages` |
| `photos.read` | Read on-device photos. Named fake methods `read` / `write` all return `CapResult` — unscoped is `scope_denied`; scoped is `photos_stub`. Never camera. Never MediaStore. |
| `photos.write` | Write on-device photos. Same CapResult shape as `photos.read`. |
| `storage.read` | Read mini-scoped key-value (capped) |
| `storage.write` | Write mini-scoped key-value (capped) |
| `billing.read` | Read Super Bundle recognition (`none` / `super`). Always muted. Named fake methods `read` / `checkout` / `portal` all return `CapResult` — unscoped is `scope_denied`; scoped checkout/portal are a `{ held: true }` stub. Never Stripe. Never gates `logSet`. |

Host **denies** undeclared scopes (`scope_denied`). Unknown mini id → `unknown_mini`. `health.train` stays `free_core: true`; a mini cannot override that. Capability bus: `packages/mw-core/src/module/capabilities.ts`. Function web stubs: `src/lib/minis/` (#935). Named doors: `src/lib/mission-os/` (`IdentityCapability`, `BillingCapability` Stripe HOLD — `read` / `checkout` / `portal`, `PhotosCapability` — `read` / `write`, `StorageCapability`, `MiniHost.mount`, `MiniHost.unmount`, `MiniHost.listMounted`, `CapResult`). In-memory fakes: `createIdentityFake`, `createBillingFake`, `createPhotosFake`, `createStorageFake`. Health stub: `HEALTH_MINI_MANIFEST` / `mountHealthMini` (identity + storage only; photos `scope_denied` on every method). ClearShot stub: `CLEARSHOT_MINI_MANIFEST` / `mountClearShotMini` (photos + storage.write; photos stay `photos_stub` on every method; billing `scope_denied` on every method). Last-segment deeplink: `resolveMiniDeeplink` / `mountMiniByDeeplink` (`src/lib/mission-os/deeplink.ts`) — `mission://minis/clearshot` → `utility.clearshot`; `mission://minis/health` → `l1.health`. Long opaque paths are `unknown_mini`. In-memory `unmount(id)` clears that mini's fake keyspace so remount cannot read leftovers. `listMounted` is the CapResult inventory — mounted ids + declared scopes only; undeclared peek → `scope_denied`; never-mounted id → `unknown_mini`. Test-only billing grant: `TEST_BILLING_MANIFEST` / `mountTestBillingMini` (`test.billing`) — not a product mount, not in the deeplink table.

## Types

`@missionwinning/mw-core` → `module` (`ModuleManifest`, `ModuleScope`, `parseModuleId`, `assertCapability`, `UTILITY_CLEARSHOT_MANIFEST`, `HOST_SHELL`, `listMountedInventory` / `peekMountedInventory` / `peekMountedScope`). Named host doors: `src/lib/mission-os/` (`MiniHost.mount`, `MiniHost.unmount`, `MiniHost.listMounted`, `CapResult`, in-memory fakes, `HEALTH_MINI_MANIFEST` / `mountHealthMini`, `CLEARSHOT_MINI_MANIFEST` / `mountClearShotMini`, `resolveMiniDeeplink` / `mountMiniByDeeplink`, billing methods `read` / `checkout` / `portal`, photos methods `read` / `write`, test-only `TEST_BILLING_MANIFEST`).

## Agent resume

- New domains: add a row here + optional manifest constant in mw-core  
- Do not invent a second user id per module  
- Games must declare `economy.earn` sources that map to allowlisted event kinds
