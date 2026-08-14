# Contract: Habit loop

**Version:** 1.0.0  
**Status:** Today week-count shipped; later OS modules hang off daily Train  
**Horizon:** Kernel — count anytime; no social / streak-shame / L2 feed

---

## Purpose

Daily **Train** is the habit loop. Later OS modules (identity, economy, games) hang off logged days — they do not replace the loop or invent a second daily ritual.

Public-safe evolution: **Habit → Identity → Money → Platform**.

## Non-goals

- Mission ID / authored Athlete Page chrome — [IDENTITY.md](IDENTITY.md) / #500  
- Super Bundle shop — [ECONOMY.md](ECONOMY.md) / #498  
- Two-day-off Start description — #492; do not duplicate  
- In-app feed, comments, DMs, Top-8 friend ranking (no WeChat / MySpace)  
- Streak-loss, “you missed”, or absence-length lecture  
- Planner or logger reading rank/points while deciding what to train  
- Invented traction; `PRIVATE_MODE` flip; EIN / live charge

## Unit

| Term | Meaning |
|------|---------|
| Habit day | One **local calendar day** with ≥1 completed, non-tombstoned Train log |
| Week | Local Monday–Sunday — `startOfLocalWeek` / `localDateKey` in `src/lib/time/localDate.ts` |
| Count | Unique habit days in the current week, including **0** |

Never derive the calendar day from `toISOString()`. Two sessions on the same local day count as one. A deleted (`deletedAt`) row does not count.

Zero is a valid, shame-free number. The line states the count; it does not verdict the gap.

## Surfaces

| Surface | Route / path | What ships |
|---------|--------------|------------|
| Today header meta | `/log` | `This week: N days logged` — both Lean and Dashboard |
| Next action | `JourneyHero` | Unchanged — still the one Start / Resume |
| Athlete Page | `/profile` | Not this contract’s product hook |

## Crossing rules

Habit count **reads logs only**.  
It may **not** read rewards, leaderboard, or social standing.  
Log domain may emit completed workouts; the planner stays blind to standing.  
Enforced: [`src/lib/domainBoundary.ts`](../../src/lib/domainBoundary.ts).

## Types

`countTrainDaysThisWeek` in [`src/lib/habitWeekCount.ts`](../../src/lib/habitWeekCount.ts).  
No `mw-core` type yet — one pure function, not a domain folder.

## Agent resume

- **Entry:** this file · [INDEX.md](INDEX.md) · frozen [HABIT_WEEK_PLAN.md](../HABIT_WEEK_PLAN.md)  
- **Do not:** add Top 8 / feeds / DMs; rewrite #492 / #498 / #500; put the count inside `JourneyHero`  
- **Tests:** `habitWeekCount.test.ts`, `classificationGuard.test.ts`
