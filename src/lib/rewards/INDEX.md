# src/lib/rewards/

> One concern: Mission Rewards — XP, ranks, and badges from real logs (local-first).

## Read order

1. `types.ts` — `RewardState`, events, awards  
2. `catalog.ts` — XP table, ranks, badge defs, level math  
3. `engine.ts` — pure `applyRewardEvent` / `applyRewardEvents`  
4. `storage.ts` — `mw_rewards` + last-awards snapshot  
5. `apply.ts` — workout / fuel / pillar / journey wire-ins  
6. `summary.ts` — Today / Profile view model  

## Rules

- Free logger is never gated by rank.  
- Weekly train goal is the boss consistency signal (not daily streak shame).  
- Events are idempotent via `claimedEventIds`.  
- No pay-to-win XP.

## Tests

| File | Covers |
|------|--------|
| `engine.test.ts` | XP caps, badges, idempotency, weekly goal, comeback |
| `summary` via engine tests | level progress |
