/**
 * Consecutive-day fuel logging streak.
 *
 * `.217` — the writer here was already correct and had been all along:
 * same-day is a no-op, yesterday increments, a gap resets to 1. The **reader**
 * was a bare `parseInt` of the stored number, so it never decayed. Log protein
 * on Monday, open Nutrition on Friday, and the app still showed Monday's count.
 *
 * The fix needed no new storage: `fuelLastLogDate` was already written on every
 * bump. The reader simply never asked for it.
 */
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { localDateKey, previousLocalDateKey } from '@/lib/time/localDate';
import { isStreakLive } from '@/lib/streakRecency';

/** Consecutive fuel-logging days — 0 unless the run reaches today or yesterday. */
export function getFuelLogStreak(): number {
  const stored = parseInt(readRaw(STORAGE_KEYS.fuelStreak) || '0', 10) || 0;
  if (stored <= 0) return 0;

  const last = readRaw(STORAGE_KEYS.fuelLastLogDate);
  return last && isStreakLive(last, localDateKey()) ? stored : 0;
}

export function bumpFuelLogStreak(): number {
  const today = localDateKey();
  const last = readRaw(STORAGE_KEYS.fuelLastLogDate);
  /*
   * Reads storage directly rather than calling `getFuelLogStreak()`, which it
   * used to do. The two predicates happen to agree today, so routing through the
   * decaying getter would still work — but only by coincidence, and a writer
   * whose correctness depends on a reader's decay rule is one edit from
   * resetting every continuation to 1.
   */
  const count = parseInt(readRaw(STORAGE_KEYS.fuelStreak) || '0', 10) || 0;

  if (last === today) return count;

  const next = last === previousLocalDateKey(today) ? count + 1 : 1;
  writeRaw(STORAGE_KEYS.fuelStreak, String(next));
  writeRaw(STORAGE_KEYS.fuelLastLogDate, today);
  return next;
}
