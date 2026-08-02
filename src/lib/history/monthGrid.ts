/**
 * A month of days, and what the app can honestly say about each one.
 *
 * The reference design for `.226` marks every non-training day with a red ✕ —
 * thirty of them for a month you did not train. Mission Winning refuses that
 * twice over.
 *
 * **It would be shame.** Horizon W excellence criterion 4 is *"missed day →
 * re-entry without shame"*, and `reentry.ts:15` already states the position:
 * a gap under four days is not an event, *"rest days are part of training"*.
 * `WeekStrip` made the same call at week scale in `.136`; a month of red is that
 * decision inverted thirty times on the screen a lapsed athlete opens first.
 *
 * **And it would be a lie.** "Missed" is not reconstructable for a past date:
 *
 *   - `coach/storage.ts` persists **one** plan and `savePlan` overwrites it, so
 *     last month's plan does not exist.
 *   - `adaptPlan` flips `planned → missed` in place, so even the current week's
 *     record is destroyed on rollover.
 *   - `generateWeek` seeds from *current* body scores and assessment risk, so a
 *     past week cannot be regenerated to compare against.
 *   - `preferredDays` is a present-tense setting with no history. Backfilling
 *     "you meant to train Tuesdays in March" from today's value is invention.
 *
 * So the vocabulary is what happened, and nothing else:
 *
 *   `trained`  — a completed, non-tombstoned session. The strongest fact here.
 *   `logged`   — the athlete used the app but did not lift: food, a check-in, an
 *                activity, a pillar win. A real fifth state the reference lacks,
 *                and the honest answer for a rest day someone still showed up for.
 *   `today`    — outlined, whatever else is true of it.
 *   `future`   — nothing has happened yet, and nothing is claimed.
 *   `none`     — blank paper. Not "missed". Not marked at all.
 *
 * **Retention is part of the honesty.** Nutrition prunes at 90 days, mind
 * check-ins cap at 90 entries and pillar wins at 100; only `workoutHistory` is
 * unbounded. So a month from last year degrades to `trained`/`none` — and a grid
 * that quietly showed fewer `logged` days for older months would be reporting
 * storage limits as behaviour. `monthIsBeyondRetention` exists so the UI can say
 * so out loud.
 */

import { localDateKey, localMonthDays, localMonthLeadingBlanks } from '@/lib/time/localDate';

export type DayMark = 'trained' | 'logged' | 'none';

export interface MonthDay {
  /** `YYYY-MM-DD`. */
  key: string;
  /** Day of month, 1-based — what the cell prints. */
  day: number;
  mark: DayMark;
  isToday: boolean;
  /** Nothing has happened yet; never marked, never counted. */
  isFuture: boolean;
  /** Completed sessions on this day, tombstones excluded. */
  sessions: number;
}

export interface MonthGrid {
  monthKey: string;
  /** Empty cells before the 1st, Monday-first. */
  leadingBlanks: number;
  days: MonthDay[];
  trainedDays: number;
  loggedDays: number;
  /** True when some of this month's non-training signals may have been pruned. */
  beyondRetention: boolean;
}

export interface MonthGridInput {
  monthKey: string;
  /** Local date keys with a completed, non-tombstoned session. */
  trainedKeys: ReadonlySet<string>;
  /** Local date keys with any other logged signal — food, check-in, activity, win. */
  loggedKeys: ReadonlySet<string>;
  /** Injected so the pure function has no clock of its own. */
  today?: Date;
}

/**
 * The window inside which a missing `logged` mark means "nothing was logged"
 * rather than "the row was pruned".
 *
 * The tightest real cap: `pruneNutritionLogToDays` and `mindCheckIns`' 90-entry
 * limit. Stated once here rather than repeated in the component, so the day the
 * retention changes there is one number to move.
 */
export const NON_TRAINING_RETENTION_DAYS = 90;

export function monthIsBeyondRetention(monthKey: string, today: Date = new Date()): boolean {
  const days = localMonthDays(monthKey);
  const last = days[days.length - 1];
  if (!last) return false;
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - NON_TRAINING_RETENTION_DAYS);
  // String compare is safe and timezone-free on `YYYY-MM-DD`, which is why every
  // key in this module is that shape and never a `Date`.
  return last < localDateKey(cutoff);
}

export function buildMonthGrid({
  monthKey,
  trainedKeys,
  loggedKeys,
  today = new Date(),
}: MonthGridInput): MonthGrid {
  const todayKey = localDateKey(today);
  const days: MonthDay[] = localMonthDays(monthKey).map((key) => {
    const trained = trainedKeys.has(key);
    return {
      key,
      // From the key, not from a `Date` — parsing `YYYY-MM-DD` back into a Date
      // reintroduces the UTC-midnight hazard this module exists to avoid.
      day: Number(key.slice(8, 10)),
      mark: trained ? 'trained' : loggedKeys.has(key) ? 'logged' : 'none',
      isToday: key === todayKey,
      isFuture: key > todayKey,
      sessions: 0,
    };
  });

  return {
    monthKey,
    leadingBlanks: localMonthLeadingBlanks(monthKey),
    days,
    trainedDays: days.filter((d) => d.mark === 'trained').length,
    loggedDays: days.filter((d) => d.mark === 'logged').length,
    beyondRetention: monthIsBeyondRetention(monthKey, today),
  };
}

/**
 * Session counts per local date, tombstones dropped.
 *
 * The `deletedAt` filter is not optional. `dayReview.ts` and `behaviorImpacts.ts`
 * both drop tombstones and `weekRecap.ts` did not until `.223`, where the
 * miscount reached a PNG shared to a public feed. A calendar that counts deleted
 * sessions tells the athlete they trained on a day they explicitly said they did
 * not.
 */
export function trainedDayKeys(
  history: readonly { completedAt: string; deletedAt?: string | null }[],
  toKey: (iso: string) => string
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const log of history) {
    if (log.deletedAt) continue;
    const key = toKey(log.completedAt);
    if (!key) continue; // `localDateKeyFromIso` returns '' for unparseable rows.
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
