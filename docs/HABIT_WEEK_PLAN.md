# Frozen plan — Habit week count + HABIT contract (`.722`)

**Status:** frozen 2026-08-13. Implement only this file. Do not mutate after the plan commit.  
**Not** the living roadmap in [PLAN.md](PLAN.md).  
**Label:** `2026.07-unified.722` (occupied `.698`–`.721`; do not steal).  
**Draft PR.** Prefer `[skip vercel]`. One Preview max.

---

## Why

Public-safe OS graph: **Habit → Identity → Money → Platform**.

| Node | Owner | This PR |
|------|--------|---------|
| Identity (Mission ID / authored Athlete Page) | #500 | **Do not touch** |
| Money (Super Bundle shop) | #498 | **Do not touch** |
| Missed-day two-day-off line | #492 | **Do not touch / do not duplicate** |
| Habit week-count | this PR | Yes — the missing public-safe node |

Keep L2 quiet. No WeChat / MySpace / Top 8.

---

## Ship (exactly two concerns)

### 1. Contract — `docs/contracts/HABIT.md`

Short contract in the same shape as IDENTITY / ECONOMY / MODULE:

- Daily **Train** is the habit loop later OS modules hang off.
- Unit: unique **local calendar days** with ≥1 completed, non-tombstoned Train log.
- Week: local Monday–Sunday via `startOfLocalWeek` / `localDateKey` — never `toISOString()`.
- **0 is valid** and shown. No streak-loss, no “you missed”, no absence lecture.
- Crossing: reads logs only. Must not read rewards / leaderboard / social (planner stays blind).
- Non-goals: Mission ID on Athlete Page, Bundle shop, #492 two-day-off line, feeds, Top 8, DMs, EIN, invented traction, `PRIVATE_MODE`.

Wire the row into [contracts/INDEX.md](contracts/INDEX.md). Point docs INDEX / help in one line each.

### 2. Product hook — one honest line on Today

Today already has a next action (`JourneyHero`). Add **one** muted meta line on `TodayPageHeader` (both Lean and Dashboard already mount it):

> This week: N days logged

- Always visible, including **N = 0**.
- Shame-free: factual count only. Copy tone like #492 (short, no verdict) — **do not** add or rewrite the “Two days off…” Start description.
- Unique days, not session count (two logs on Monday = 1).
- Tombstones excluded (same as `weekRecap`).
- Do not put the line inside `JourneyHero` (that description is #492’s seam).
- Do not add a new Today block (budget). Do not restyle Train / Profile / Bundle.

Pure function: `src/lib/habitWeekCount.ts` → `countTrainDaysThisWeek(history, now?)`.

i18n: one `todayHabitWeekCount` key (`This week: {{count}} days logged`) on `TodayStrings` + `en` (zh/id/th/ar inherit via `en.*` fallback). Bootstrap EN so Lean first paint has it.

---

## Tests

- `habitWeekCount.test.ts`: **0** and **N**; same-day collapse; last-week → 0; tombstone excluded; injected `now` (no expiring “today” literals).
- `HABIT.md` exists (classificationGuard docs-exist list + contract assert).
- `classificationGuard` still stubs war-room (`RELOCATED_TO_MISSION_OPS`).
- Header wiring: Lean + Dashboard pass the count; header renders the key.
- Copy guard: week-count string has no missed / streak / “you haven’t”.
- `check-build-label` `.722`; LOG + CONTEXT `## Now` (rotate oldest if over budget).
- Excellence-Override: `habit week count + HABIT contract`.

---

## Hard bans

No `PRIVATE_MODE`. Don’t merge. Don’t steal `.698`/`.699`. Don’t rewrite #492, #500, #498. No EIN. No invented traction. No WeChat/MySpace/Top 8.

---

## Out of scope

Athlete Page Mission ID, Bundle shop, two-day-off Start line, mw-core habit types, new Today card, streak chrome, outbound nudges, Android.
