/**
 * Local calendar dates, and the week they belong to — one implementation.
 *
 * This module exists because the repo had **six** independent derivations of
 * "start of the week" and **five** of "local YYYY-MM-DD", and the copies did not
 * agree. Four of the six week functions were wrong, each in a different band of
 * the world:
 *
 *   - `activityLog`, `challenges` and `pillarScoreInputs` called `toISOString()`
 *     on a local date. `toISOString()` is UTC by definition, so east of UTC the
 *     answer was the previous day for most of the evening. Verified under
 *     `TZ=Asia/Tokyo`: the week began Sunday 07-26 when the correct Monday was
 *     07-27.
 *   - `coach/splitPlanner` anchored to local noon first, which looks like a fix
 *     and covers |offset| < 12 — but not UTC+13 or UTC+14. Verified under
 *     `TZ=Pacific/Kiritimati` (UTC+14): same off-by-one-week.
 *
 * The consequence was not cosmetic. `getWeeklyStats()`, the weekly challenge
 * state and the pillar-win counter disagreed with the coach plan and the week
 * recap about which week it was — timezone- and time-of-day-dependent, which is
 * exactly why a suite that runs near UTC midday never saw it.
 *
 * **The rule: never `toISOString()` for a calendar date.** An ISO string is an
 * instant in UTC; a calendar date is a local fact. The two coincide only for
 * users in a narrow band of longitudes, which is not a property to build on.
 */

/** Local calendar date as `YYYY-MM-DD`, from local fields only. */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Local calendar date of an ISO timestamp, or `''` when unparseable.
 *
 * The empty string rather than a throw or a fallback date: these run over
 * whatever is in device storage, including rows written by an older build, and
 * a wrong date silently joins the wrong week. Callers filter on `''`.
 */
export function localDateKeyFromIso(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : localDateKey(d);
}

/**
 * The calendar day before `key` (`YYYY-MM-DD` in, `YYYY-MM-DD` out).
 *
 * Built from local fields, **never** from `Date.parse(key)`. Parsing a bare
 * `YYYY-MM-DD` yields UTC midnight, so `new Date('2026-03-29')` in Berlin is
 * 01:00 local — subtract a day across a DST boundary from that and the answer
 * drifts. Constructing from the parts keeps every step in local time, the same
 * discipline `startOfLocalWeek` follows.
 *
 * `.217` added this because "yesterday" was being derived in two places with two
 * spellings (`fuelStreak` did it correctly inline, `streaks` diffed UTC
 * milliseconds), and a calendar fact with two derivations is `.178` waiting to
 * happen — which is the entire reason this module exists.
 */
export function previousLocalDateKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return '';
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

/**
 * Midnight local on the Monday of `d`'s week.
 *
 * The `setHours`/`setDate` order is **not** load-bearing — an earlier draft of
 * this comment claimed it guarded a DST hazard, a mutant showed no test backed
 * that up, and a sweep of 2026 across nine DST-heavy zones (Santiago, Beirut,
 * Havana, Lord Howe, Chatham …) at six hours a day found **zero** dates where
 * the two orders disagree. The claim is gone rather than tested, because a
 * comment asserting a mechanism nobody verified is the `.195` defect in prose.
 *
 * What *is* load-bearing is that both steps are local-field operations and the
 * result is never passed through `toISOString()`.
 */
export function startOfLocalWeek(d: Date = new Date()): Date {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay(); // 0 Sun … 6 Sat
  start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day));
  return start;
}

/** The Monday of `d`'s week as `YYYY-MM-DD`. */
export function localWeekKey(d: Date = new Date()): string {
  return localDateKey(startOfLocalWeek(d));
}

/**
 * `YYYY-MM` for the month `d` falls in — the month grid's addressing key.
 *
 * Same discipline as everything above: local fields, no `toISOString()`.
 */
export function localMonthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * The month `delta` months from `monthKey`, clamped by JS `Date` rollover.
 *
 * `new Date(y, m, 1)` handles `m = -1` and `m = 12` correctly by construction, so
 * December→January needs no special case. Built from parts rather than by
 * mutating a parsed date: parsing a bare `YYYY-MM` gives UTC midnight, which is
 * the previous month for anyone west of Greenwich on the 1st.
 */
export function shiftLocalMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) return monthKey;
  return localMonthKey(new Date(y, m - 1 + delta, 1));
}

/**
 * Every local date in `monthKey`, in order, as `YYYY-MM-DD`.
 *
 * Length comes from the calendar, not from a table: `new Date(y, m, 0)` is the
 * last day of month `m-1`, so February 2028 answers 29 without a leap-year rule
 * anyone has to remember to write.
 */
export function localMonthDays(monthKey: string): string[] {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) return [];
  const days = new Date(y, m, 0).getDate();
  return Array.from({ length: days }, (_, i) => localDateKey(new Date(y, m - 1, i + 1)));
}

/**
 * How many blank cells precede the 1st in a Monday-first grid.
 *
 * Monday-first because this repo already is, everywhere — `startOfLocalWeek`,
 * `WeekStrip`, `challenges`, `weekRecap`, `historyAnalytics`. A month grid that
 * introduced a locale-aware week start would be the *seventh* derivation of
 * "when does a week begin", which is the defect `localDate.ts` was created to end.
 */
export function localMonthLeadingBlanks(monthKey: string): number {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) return 0;
  const firstDow = new Date(y, m - 1, 1).getDay(); // 0 Sun … 6 Sat
  return firstDow === 0 ? 6 : firstDow - 1;
}

/**
 * Format YYYY-MM-DD for display without UTC midnight shift.
 * Deliberately not `new Date(key)` — bare date strings parse as UTC midnight.
 */
export function formatLocalDateKey(
  key: string,
  locale: string,
  opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return key;
  return new Date(y, m - 1, d, 12).toLocaleDateString(locale, opts);
}
