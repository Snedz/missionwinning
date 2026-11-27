/**
 * What makes a streak a streak.
 *
 * `.217` — this repo had **two** streak implementations, and between them they
 * had exactly one correct half each.
 *
 *   - `fuelStreak` writes correctly (same-day is a no-op, yesterday increments,
 *     a gap resets to 1) and then **reads a bare `parseInt`** of the stored
 *     number. Log protein on Monday, open Nutrition on Friday, still see
 *     Monday's count.
 *   - `streaks` reads a stored override unconditionally, and its computed
 *     fallback walks backwards from `dates[0]` **without ever asking when
 *     `dates[0]` was**. Train five days, stop for three months, still see
 *     "5-day streak".
 *
 * So the correct writer and the correct reader both already existed, in
 * different files, and neither streak had both. This module is the one
 * definition (`.178`), and both now use it.
 *
 * ## Why this is not a cosmetic fix
 *
 * The training streak is not decoration. It reaches `weekRecap` (the **shared
 * debrief text and the share-card title**), `missionJourney` (where
 * `streak >= 7` satisfies a **commissioning milestone**), and
 * `computeLocalStats` → `computeWinScore` (the **public leaderboard**). A number
 * that cannot go down, feeding a ranking and a public card, is the `.208` class
 * at its most expensive.
 *
 * `dayReview.ts` already refused to read it — *"that value can be overridden by
 * a localStorage key, so it is unfit for a factual sentence"* — which means one
 * consumer noticed and routed around it while three others kept using it as
 * fact.
 *
 * ## The definition, stated once
 *
 * A streak is **live** when the most recent qualifying day is today or
 * yesterday. Yesterday counts because someone who trained last night and opens
 * the app at 07:00 has broken nothing; that is the only grace in the rule, and
 * it is what "consecutive days" already means. Anything older is 0 — founder
 * decision, recorded: hard truth, no grace period.
 */

import { previousLocalDateKey } from '@/lib/time/localDate';

/**
 * Is a streak whose most recent day is `newestKey` still running as of `todayKey`?
 *
 * Both arguments are `YYYY-MM-DD`. Takes `todayKey` rather than reading the
 * clock so the boundary cases are assertable without mocking time — the `.212`
 * lesson, where a date bug hid behind a function that fetched its own "now".
 */
export function isStreakLive(newestKey: string, todayKey: string): boolean {
  if (!newestKey || !todayKey) return false;
  return newestKey === todayKey || newestKey === previousLocalDateKey(todayKey);
}

/**
 * Consecutive-day count ending today or yesterday, else 0.
 *
 * Walks by **expected calendar day** rather than by differencing timestamps. The
 * old implementation did `(new Date(a) - new Date(b)) / 86400000`, which happens
 * to work because both parse to UTC midnight — but it is one refactor away from
 * being wrong, and it is the spelling `.199` and `.212` were both about.
 *
 * `dates` may arrive in any order and may contain duplicates or `''` (which is
 * what `localDateKeyFromIso` returns for an unparseable timestamp, and those
 * must not be treated as a day).
 */
export function streakFromDates(dates: readonly string[], todayKey: string): number {
  const unique = [...new Set(dates.filter(Boolean))].sort().reverse();
  if (unique.length === 0) return 0;
  if (!isStreakLive(unique[0], todayKey)) return 0;

  let streak = 1;
  let expected = previousLocalDateKey(unique[0]);
  for (let i = 1; i < unique.length; i += 1) {
    if (unique[i] !== expected) break;
    streak += 1;
    expected = previousLocalDateKey(expected);
  }
  return streak;
}
