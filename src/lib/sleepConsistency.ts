/**
 * Sleep consistency — the honest phone-only sleep metric.
 *
 * The screenshot that prompted this wave said *"sleep debt is now 2h 7m 48s."*
 * We will not print that number, for two reasons. It is not computable here —
 * there is no HealthKit web API on iOS and no background sync in a PWA, so the
 * only sleep signal available is what the athlete taps. And it would not be
 * honest even with a wrist sensor: self-reported and diary-based sleep timing
 * disagrees with measured sleep by an hour or more, so seconds of resolution is
 * theatre. A quantified physiological deficit is also the shape of claim that
 * reads as a device function rather than a wellness feature.
 *
 * So this reports **regularity**, which is the better metric anyway: in a
 * 60,000-person accelerometry study, how *consistent* sleep timing was
 * predicted outcomes more strongly than how *long* people slept. Two taps a day
 * produce it, and it belongs to no wearable company.
 *
 * Everything here is banded or counted. No score out of a hundred, no stopwatch,
 * and every duration that does surface is rounded to the quarter hour — the
 * resolution the underlying self-report can actually support.
 */

import type { MindCheckIn } from '@/lib/mindCheckIns';
import { normalizeBehaviors, roundToQuarterHour } from '@/lib/behaviors';

/** Fewer nights than this in the window and there is nothing to say. */
export const MIN_NIGHTS = 5;
export const WINDOW_DAYS = 14;
/** Median absolute deviation thresholds, in minutes. */
export const STEADY_MAX_SPREAD = 30;
export const DRIFTING_MAX_SPREAD = 75;

export type ConsistencyBand = 'steady' | 'drifting' | 'scattered';

export interface SleepConsistency {
  /** Nights in the window with a usable bed time. */
  nights: number;
  /** Median bed time as minutes since the prior noon — see `bedMinutes`. */
  usualBedMinutes: number;
  /** Typical spread around that median, minutes (median absolute deviation). */
  spreadMinutes: number;
  /** Of the last 7 logged nights, how many were later than usual by >30 min. */
  laterThanUsualOf7: number;
  loggedOf7: number;
  band: ConsistencyBand;
}

/**
 * Minutes since the previous noon.
 *
 * Bed times straddle midnight, so raw clock minutes make 23:45 and 00:15 look
 * twenty-three and a half hours apart when they are thirty minutes apart.
 * Anchoring the day at noon puts a normal night's range on one continuous line.
 */
export function bedMinutes(hhmm: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const total = Number(m[1]) * 60 + Number(m[2]);
  return total >= 12 * 60 ? total - 12 * 60 : total + 12 * 60;
}

function median(xs: number[]): number {
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

/**
 * Minutes-since-noon back to a wall-clock "HH:MM", at quarter-hour resolution.
 *
 * The rounding is `roundToQuarterHour`'s, not a second copy of it. This file
 * carried its own `Math.round(total / 15) * 15` — a third definition of one
 * rule, and the one place a midnight wrap could have been got wrong
 * independently of the other two.
 */
export function bedClock(minutesSinceNoon: number): string {
  const day = 24 * 60;
  const total = (((minutesSinceNoon + 12 * 60) % day) + day) % day;
  const h = String(Math.floor(total / 60)).padStart(2, '0');
  const m = String(total % 60).padStart(2, '0');
  // Non-null: `total` is always a well-formed in-range clock time by construction.
  return roundToQuarterHour(`${h}:${m}`)!;
}

function dateKey(iso: string): number {
  const t = Date.parse(`${iso}T00:00:00`);
  return Number.isFinite(t) ? t : NaN;
}

type LoggedNight = { at: number; minutes: number };

/** Usable bed times inside the window, newest first. */
function loggedNights(checkIns: MindCheckIn[], now: Date): LoggedNight[] {
  const cutoff = now.getTime() - WINDOW_DAYS * 86_400_000;
  return checkIns
    .map((c) => {
      const bed = normalizeBehaviors(c.behaviors)?.bedTime;
      const at = dateKey(c.date);
      if (!bed || !Number.isFinite(at) || at < cutoff) return null;
      const minutes = bedMinutes(bed);
      return minutes === null ? null : { at, minutes };
    })
    .filter((n): n is LoggedNight => n !== null)
    .sort((a, b) => b.at - a.at);
}

/**
 * Null whenever the window cannot support a sentence. Silence is the correct
 * output for four nights of data, not a hedged one.
 */
export function computeSleepConsistency(
  checkIns: MindCheckIn[],
  now: Date = new Date()
): SleepConsistency | null {
  const nights = loggedNights(checkIns, now);

  if (nights.length < MIN_NIGHTS) return null;

  const usual = median(nights.map((n) => n.minutes));
  const spread = median(nights.map((n) => Math.abs(n.minutes - usual)));
  const lastSeven = nights.slice(0, 7);

  return {
    nights: nights.length,
    usualBedMinutes: usual,
    spreadMinutes: spread,
    laterThanUsualOf7: lastSeven.filter((n) => n.minutes - usual > 30).length,
    loggedOf7: lastSeven.length,
    band:
      spread <= STEADY_MAX_SPREAD
        ? 'steady'
        : spread <= DRIFTING_MAX_SPREAD
          ? 'drifting'
          : 'scattered',
  };
}

const BAND_WORD: Record<ConsistencyBand, string> = {
  steady: 'steady',
  drifting: 'drifting',
  scattered: 'scattered',
};

/**
 * One sentence, describing what was logged and stopping there.
 *
 * No "you should", no target, no deficit — the athlete's own pattern, said back
 * to them. Times are quarter-hour; counts are counts.
 */
export function consistencyLine(c: SleepConsistency): string {
  const head = `Your bed time is running ${BAND_WORD[c.band]} — usually around ${bedClock(
    c.usualBedMinutes
  )} across ${c.nights} logged nights.`;
  if (c.laterThanUsualOf7 === 0) return head;
  const nights = c.laterThanUsualOf7 === 1 ? 'night was' : 'nights were';
  return `${head} ${c.laterThanUsualOf7} of your last ${c.loggedOf7} ${nights} later than that.`;
}

export interface SleepCollecting {
  /** Usable bed times logged inside the window. */
  nights: number;
  /** How many the band needs before there is anything to say. */
  needed: number;
}

/**
 * The nights-so-far, for the stretch where `computeSleepConsistency` is still
 * silent — the same courtesy `behaviorImpacts` extends with its `collecting`
 * state. An athlete who has logged four nights should be told the fifth is what
 * unlocks the sentence, not left to wonder whether the feature is broken.
 *
 * Null in both directions: nothing logged yet is not a progress bar to nag at
 * (mirroring the `flagged + unflagged > 0` rule), and a window that already
 * clears `MIN_NIGHTS` has a real line to show instead.
 */
export function sleepConsistencyProgress(
  checkIns: MindCheckIn[],
  now: Date = new Date()
): SleepCollecting | null {
  const nights = loggedNights(checkIns, now).length;
  if (nights === 0 || nights >= MIN_NIGHTS) return null;
  return { nights, needed: MIN_NIGHTS };
}

/** States the count and stops. No target bed time, no encouragement. */
export function sleepCollectingLine(p: SleepCollecting): string {
  const nights = p.nights === 1 ? 'night' : 'nights';
  return `Bed time: ${p.nights} of ${p.needed} ${nights} logged — the pattern needs ${p.needed} before it says anything.`;
}
