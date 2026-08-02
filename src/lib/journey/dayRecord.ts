/**
 * Everything one day held, and the days either side of it.
 *
 * `.251` — the other half of `.247`. Tesla's VPP dashboard lets you go back to
 * a specific grid event and see what the fleet actually did; the equivalent
 * here is a day the athlete actually lived. `.247` built the index
 * ({@link listDaysWithData}); this reads a single entry out of it.
 *
 * ## It collects nothing of its own
 *
 * [`gatherJournalEntries`](../todayTrends.ts) already walks every pillar store
 * and returns one shape. Writing a second cross-pillar collector here — even a
 * slightly better one — is `.178`, and this repo has paid for that six times in
 * the last thirty builds. So this filters what that returns and does not
 * re-derive it. When a new pillar starts logging, both surfaces gain it at once
 * or neither does.
 *
 * ## Local days, not UTC ones
 *
 * Bucketing goes through `localDateKeyFromIso`, which is `.245`'s rule. The
 * entries arrive with two timestamp shapes — real ISO instants from workouts
 * and pillar wins, and `${date}T12:00:00` strings synthesised for meals and
 * check-ins — and both are correct through that function: a bare local datetime
 * parses as local, and an instant converts to local. Slicing either would have
 * put an Auckland morning on the previous day.
 */

import type { CompletedWorkoutLog } from '@/types';
import { gatherJournalEntries, type JournalEntry } from '@/lib/todayTrends';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import { listDaysWithData } from '@/lib/journey/daysWithData';

export interface DayRecord {
  /** `YYYY-MM-DD`, the local day this record is for. */
  day: string;
  /**
   * Everything logged that day, **earliest first**.
   *
   * The opposite of `gatherJournalEntries`, deliberately. Newest-first is right
   * for a *feed*, where recency is the whole point and the list has no end —
   * that is why the Today strip reads that way. This is a **bounded day being
   * replayed**, and a day reads forwards: the walk at 1am, the session at 7,
   * breakfast after it, the check-in that night. Rendering it newest-first made
   * the page describe the evening before the morning, which is not how anyone
   * remembers a day.
   */
  entries: JournalEntry[];
  /** The nearest day with data before this one, or null at the beginning. */
  previous: string | null;
  /** The nearest day with data after this one, or null at the most recent. */
  next: string | null;
  /** Position in the record, 1-based and counting from the earliest day. */
  index: number | null;
  /** How many days hold data in total — the `.247` count. */
  total: number;
}

/**
 * Deliberately far above any single day's real volume.
 *
 * `gatherJournalEntries` takes a limit and sorts newest-first, so a small one
 * would silently truncate *older days out of existence* — the day would render
 * empty rather than missing, which is the worse of the two failures. The cost
 * is one pass over stores that are themselves capped.
 */
const GATHER_CEILING = 5000;

export function isDayKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function buildDayRecord(day: string, history: CompletedWorkoutLog[]): DayRecord {
  const days = listDaysWithData();
  // `listDaysWithData` is newest-first; reading the record forwards is what a
  // human means by "the next day", so the neighbours are taken from the
  // chronological order rather than the storage order.
  const chronological = [...days].reverse();
  const at = chronological.indexOf(day);

  const entries = isDayKey(day)
    ? gatherJournalEntries(history, GATHER_CEILING)
        .filter((e) => localDateKeyFromIso(e.at) === day)
        .sort((a, b) => a.at.localeCompare(b.at))
    : [];

  return {
    day,
    entries,
    previous: at > 0 ? chronological[at - 1] : null,
    next: at >= 0 && at < chronological.length - 1 ? chronological[at + 1] : null,
    index: at >= 0 ? at + 1 : null,
    total: chronological.length,
  };
}
