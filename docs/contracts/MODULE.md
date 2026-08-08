# Contract: Module host (mini-app)

**Version:** 1.0.0  
**Status:** Spec + types only — host runtime is post-PMF  
**Horizon:** Types anytime; host implementation Horizon 3+ / platform era

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
  entry: /active
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
| `game.*` | Future | reserved |
| `host.shell` | Future mini-host | n/a |

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

Host (future) **denies** undeclared scopes. Today the web monolith is implicit full access inside first-party code; the manifest is the long-term contract.

## Types

`@missionwinning/mw-core` → `module` (`ModuleManifest`, `ModuleScope`, `parseModuleId`).

## Agent resume

- New domains: add a row here + optional manifest constant in mw-core  
- Do not invent a second user id per module  
- Games must declare `economy.earn` sources that map to allowlisted event kinds
