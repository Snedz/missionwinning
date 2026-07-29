/**
 * Training load from logged sets alone — no strap, no HRV, no account.
 *
 * This is the engine behind "that session ran hot for you". WHOOP can say
 * "15.3 strain against your 11.8 upper bound" because it knows your heart. We can say
 * the equivalent because we know your sets — and unlike a wearable, the number is
 * yours whether or not you ever sign in.
 *
 * ## What is computed, and why this shape
 *
 * `load` is **Foster's session-RPE**: session RPE × duration in minutes. It is the
 * validated field standard, it is comparable across sessions of different modality,
 * and critically it is *one multiplication* — not an invented composite of tonnage,
 * density and RPE that would look scientific while meaning nothing. Tonnage is
 * reported alongside it because lifters think in kilos moved, but the ratio maths
 * runs on sRPE.
 *
 * `ratio` is the **acute:chronic workload ratio** (ACWR), EWMA variant. Rolling
 * averages suffer mathematical coupling — the same sessions appear in numerator and
 * denominator — so the exponentially-weighted form is the improvement, and it
 * degrades far better on the sparse, gappy history a 3x/week lifter actually
 * produces.
 *
 * ## What this is NOT
 *
 * ACWR is validated in **team sports**, is actively contested in the literature, and
 * has **never been validated for recreational lifting**. So:
 *
 * - This is **descriptive, not predictive**. It says how this week compares to your
 *   own recent baseline. It does not forecast injury and must never be phrased as if
 *   it does — see docs/LEGAL_SAFETY.md §3a on medical claims.
 * - With less than `MIN_DAYS_FOR_RATIO` days of history, `ratio` is **null**, not a
 *   plausible-looking number. A fabricated baseline is exactly the defect `.127`
 *   removed when it deleted a day-zero Readiness of 42 in favour of "Not measured".
 *
 * Pure and dependency-free on purpose: the same numbers must come out on web,
 * Android and iOS, and every one of them is unit-testable.
 */

import type { CompletedWorkoutLog, Rpe } from '@/types';

/**
 * Categorical RPE → Borg CR10. The logger asks for easy/med/hard rather than a
 * number because a 1-10 field mid-set is a lie for most people; these are the
 * conventional anchors for the three-point version.
 */
const RPE_SCORE: Record<Rpe, number> = { easy: 5, med: 7, hard: 9 };

/** An unrated working set is assumed moderate — the middle, never the flattering end. */
const DEFAULT_RPE = RPE_SCORE.med;

/** Chronic load below this many days of history is noise, so the ratio stays null. */
export const MIN_DAYS_FOR_RATIO = 14;

const ACUTE_DAYS = 7;
const CHRONIC_DAYS = 28;

/** The consensus "sweet spot" band from the team-sport literature. Descriptive only. */
export const RATIO_LOW = 0.8;
export const RATIO_HIGH = 1.3;

export type LoadZone = 'unknown' | 'light' | 'steady' | 'high';

export interface SessionLoad {
  /** UTC yyyy-mm-dd of completion. */
  date: string;
  /** Sum of reps × weight over working sets. Zero for pure bodyweight work. */
  tonnage: number;
  workingSets: number;
  durationMinutes: number;
  /** Borg CR10, 5–9. Tonnage-weighted where tonnage exists. */
  sessionRpe: number;
  /** Foster session-RPE load in arbitrary units: sessionRpe × durationMinutes. */
  load: number;
}

export interface LoadBands {
  /** EWMA over ~7 days. */
  acute: number;
  /** EWMA over ~28 days. */
  chronic: number;
  /** acute ÷ chronic, or null when history is too short to mean anything. */
  ratio: number | null;
  zone: LoadZone;
  /** Days between the first logged session and now — the basis for the null above. */
  daysOfHistory: number;
}

function utcDay(d: string | Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

/** Working sets only: warmups are not load the athlete is meant to recover from. */
function isWorkingSet(kind: string | undefined): boolean {
  return kind !== 'warmup';
}

/**
 * One session's load.
 *
 * `sessionRpe` is weighted by tonnage so a hard heavy triple counts for more than a
 * hard set of band pull-aparts. When every set is bodyweight the tonnage weights are
 * all zero, so it falls back to a plain mean — otherwise the whole session would
 * divide by zero and a calisthenics athlete would get `NaN` for their trouble.
 */
export function sessionLoad(log: CompletedWorkoutLog): SessionLoad {
  let tonnage = 0;
  let workingSets = 0;
  let weightedRpe = 0;
  let rpeSum = 0;

  for (const ex of log.exercises ?? []) {
    for (const set of ex.sets ?? []) {
      if (!isWorkingSet(set.kind)) continue;
      const reps = Number.isFinite(set.reps) ? set.reps : 0;
      const weight = Number.isFinite(set.weight) ? set.weight : 0;
      const setTonnage = Math.max(0, reps * weight);
      const rpe = set.rpe ? RPE_SCORE[set.rpe] : DEFAULT_RPE;

      workingSets += 1;
      tonnage += setTonnage;
      weightedRpe += rpe * setTonnage;
      rpeSum += rpe;
    }
  }

  const sessionRpe =
    workingSets === 0 ? 0 : tonnage > 0 ? weightedRpe / tonnage : rpeSum / workingSets;

  const durationMinutes = Math.max(0, Math.round((log.durationSeconds ?? 0) / 60));

  return {
    date: utcDay(log.completedAt),
    tonnage: Math.round(tonnage),
    workingSets,
    durationMinutes,
    sessionRpe: Math.round(sessionRpe * 10) / 10,
    load: Math.round(sessionRpe * durationMinutes),
  };
}

/** Per-session loads, oldest first, tombstones excluded. */
export function loadSeries(history: CompletedWorkoutLog[]): SessionLoad[] {
  return history
    .filter((l) => !l.deletedAt)
    .map(sessionLoad)
    .filter((s) => s.workingSets > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * EWMA over daily load, walking every calendar day so rest days pull the average
 * down the way they should. Skipping empty days would make a 1x/week lifter look
 * identical to a 5x/week one.
 */
function ewma(dailyLoad: Map<string, number>, from: Date, to: Date, days: number): number {
  const lambda = 2 / (days + 1);
  let value = 0;
  const cursor = new Date(from);
  while (cursor <= to) {
    const today = dailyLoad.get(cursor.toISOString().slice(0, 10)) ?? 0;
    value = today * lambda + value * (1 - lambda);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return value;
}

export function loadBands(history: CompletedWorkoutLog[], now = new Date()): LoadBands {
  const series = loadSeries(history);

  if (series.length === 0) {
    return { acute: 0, chronic: 0, ratio: null, zone: 'unknown', daysOfHistory: 0 };
  }

  const daily = new Map<string, number>();
  for (const s of series) daily.set(s.date, (daily.get(s.date) ?? 0) + s.load);

  const first = new Date(`${series[0].date}T00:00:00Z`);
  const end = new Date(`${utcDay(now)}T00:00:00Z`);
  const daysOfHistory = Math.max(
    0,
    Math.floor((end.getTime() - first.getTime()) / 86_400_000) + 1
  );

  // Start the walk a full chronic window before the end so the EWMA has run up to a
  // stable value rather than starting cold at whatever today happens to be.
  const walkFrom = new Date(end);
  walkFrom.setUTCDate(walkFrom.getUTCDate() - (CHRONIC_DAYS * 2));

  const acute = ewma(daily, walkFrom, end, ACUTE_DAYS);
  const chronic = ewma(daily, walkFrom, end, CHRONIC_DAYS);

  if (daysOfHistory < MIN_DAYS_FOR_RATIO || chronic <= 0) {
    return {
      acute: Math.round(acute),
      chronic: Math.round(chronic),
      ratio: null,
      zone: 'unknown',
      daysOfHistory,
    };
  }

  const ratio = acute / chronic;
  const zone: LoadZone = ratio < RATIO_LOW ? 'light' : ratio > RATIO_HIGH ? 'high' : 'steady';

  return {
    acute: Math.round(acute),
    chronic: Math.round(chronic),
    ratio: Math.round(ratio * 100) / 100,
    zone,
    daysOfHistory,
  };
}

/**
 * How this session compares to the athlete's own recent sessions — the sentence
 * "that ran hotter than your usual" is built from this, and only when `baseline`
 * is non-null. Comparing a session to a baseline of one session is not a comparison.
 */
export function compareToBaseline(
  session: SessionLoad,
  history: CompletedWorkoutLog[],
  now = new Date()
): { baseline: number | null; deltaPct: number | null } {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - CHRONIC_DAYS);
  const cutoffDay = cutoff.toISOString().slice(0, 10);

  const prior = loadSeries(history).filter(
    (s) => s.date >= cutoffDay && s.date < session.date
  );

  if (prior.length < 3) return { baseline: null, deltaPct: null };

  const baseline = prior.reduce((sum, s) => sum + s.load, 0) / prior.length;
  if (baseline <= 0) return { baseline: null, deltaPct: null };

  return {
    baseline: Math.round(baseline),
    deltaPct: Math.round(((session.load - baseline) / baseline) * 100),
  };
}
