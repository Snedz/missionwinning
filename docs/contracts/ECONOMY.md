# Contract: Mission Economy

**Version:** 1.0.0  
**Status:** Local Rewards XP shipped; Club server ledger planned  
**Horizon:** Product surfaces gated by [CLUB_PLAN.md](../CLUB_PLAN.md); types anytime

---

## Purpose

A single **odometer of logged work** and an **inventory of earned cosmetics** shared by health, club, and future games — without pay-to-win and without client minting.

## Invariants (load-bearing)

1. Points/XP reward **logged work**, never attention (opens, views, notification taps).  
2. **No client grant API** — server (when public) re-derives from source tables; local engine is exact for you only. Sequential **Mission ID** follows the same rule: GET-only claim, never a client-chosen integer ([IDENTITY.md](IDENTITY.md)).  
3. **Monotonic** — no decay, no relegation, no revoked tier.  
4. **Virtual-only, earned-only** — nothing purchasable for rank.  
5. Free logger is never gated by rank.  
6. Standing never appears in the return channel (nudges/email/push).  
7. Game skill rating (future) is **not** the same number as Club points.

## Event model (conceptual)

```text
source of truth (workout_logs, journey, …)
        │
        ▼
  pure apply(event) → RewardState / ledger rows
        │
        ├── local summary (Today / Profile)
        └── server recompute window (future boards)
```

Local engine today: `src/lib/rewards/engine.ts` + `catalog.ts`.  
Shared types for cross-module inventory: `packages/mw-core/src/economy/`.

## Inventory

```ts
// conceptual — see mw-core economy types
{
  itemId: string;      // e.g. frame:poster, badge:first_blood
  source: string;      // module id that granted
  earnedAt: string;    // ISO
  module: string;      // health.train | club | game.*
}
```

Cosmetics (card frames/backdrops) unlock by **tier from level**, not a denormalized grant table (`resolveCardCosmetics`).

## Types

`@missionwinning/mw-core` → `economy` (`EconomyEventKind`, `InventoryItem`, `EarnCap`).

## Agent resume

- **Entry:** `src/lib/rewards/INDEX.md`, [CLUB_PLAN.md](../CLUB_PLAN.md)  
- **Forbidden:** client-side “give me points” API; points in nudge copy  
- **Tests:** `engine.test.ts`, club tone via `reentryTone`
