/**
 * The metrics an athlete can ask for a trend of.
 *
 * `.225` — one registry over series this app **already computes**, so asking
 * for a trend cannot invent a quantity the product does not measure.
 *
 * ## Training, not health
 *
 * There is no HRV here, no resting heart rate, no sleep duration — and their
 * absence is a decision, not a gap. This is a PWA with no wearable: it cannot
 * measure any of them, and [`sleepConsistency.ts`](../sleepConsistency.ts) is
 * already an explicit refusal to print a sleep number this app cannot compute.
 * A registry that listed them would make the *asking* surface promise what the
 * *measuring* surface refuses, which is `.195` in reverse — offering a reader
 * for data that has no writer.
 *
 * ## Every entry names its source
 *
 * `source` is not documentation, it is the reason the entry is allowed to
 * exist: a metric with no existing series behind it does not go in the table.
 * `.178` is the standing risk in a registry like this — it would be very easy
 * to re-derive "weekly volume" here rather than call the function that already
 * says it, and then have two answers to one question.
 */

import type { BodyMetricKey } from '@/lib/bodyMetrics';

export type TrendMetricId =
  | 'volume'
  | 'sessions'
  | 'protein'
  | 'active'
  | 'bodyweight'
  | 'bodyfat'
  | 'waist';

/** What the numbers are, so a caller can label an axis without guessing. */
export type TrendUnit = 'weight' | 'count' | 'grams' | 'minutes' | 'percent' | 'cm';

export interface TrendMetricDef {
  id: TrendMetricId;
  /** i18n key; the lib stays free of translation, the UI resolves it. */
  labelKey: string;
  /** Fallback copy, and the English answer when no catalogue is loaded. */
  label: string;
  unit: TrendUnit;
  /**
   * Where the series comes from. A metric with no existing source does not
   * belong in this table — see the header.
   */
  source: string;
  /** The body-metric key, when this metric is one. */
  bodyMetric?: BodyMetricKey;
  /**
   * Words that select this metric, matched **whole-word** against a normalised
   * query — "active" must not fire on "inactive".
   *
   * Order carries no meaning. `parseTrendQuery` once ranked matches by phrase
   * length, and mutation testing showed that ranking changed no result: a
   * phrase belongs to exactly one metric, so which of its phrases matched
   * cannot change the answer. The overlap is forbidden by
   * `no phrase of one metric is contained in another metric's` instead.
   */
  match: string[];
}

export const TREND_METRICS: TrendMetricDef[] = [
  {
    id: 'volume',
    labelKey: 'trendVolume',
    label: 'Training volume',
    unit: 'weight',
    source: 'buildTodayTrends → volume (daily) · buildWeeklyVolumeTimeline (weekly)',
    match: ['volume', 'training volume', 'tonnage', 'total load', 'workload'],
  },
  {
    id: 'sessions',
    labelKey: 'trendSessions',
    label: 'Sessions',
    unit: 'count',
    source: 'buildTodayTrends → sessions',
    match: ['sessions', 'session', 'workouts', 'workout', 'training frequency', 'frequency'],
  },
  {
    id: 'protein',
    labelKey: 'trendProtein',
    label: 'Protein',
    unit: 'grams',
    source: 'buildTodayTrends → protein (nutritionLog)',
    match: ['protein'],
  },
  {
    id: 'active',
    labelKey: 'trendActive',
    label: 'Active minutes',
    unit: 'minutes',
    source: 'buildTodayTrends → active (activityLog)',
    match: ['active', 'activity', 'active minutes', 'movement', 'cardio'],
  },
  {
    id: 'bodyweight',
    labelKey: 'trendBodyweight',
    label: 'Bodyweight',
    unit: 'weight',
    source: 'bodyMetrics.series("weightKg")',
    bodyMetric: 'weightKg',
    match: ['scale', 'bodyweight', 'my weight', 'body weight'],
  },
  {
    id: 'bodyfat',
    labelKey: 'trendBodyfat',
    label: 'Body fat',
    unit: 'percent',
    source: 'bodyMetrics.series("bodyFatPct")',
    bodyMetric: 'bodyFatPct',
    match: ['body fat', 'bodyfat', 'body fat percentage', 'bf%'],
  },
  {
    id: 'waist',
    labelKey: 'trendWaist',
    label: 'Waist',
    unit: 'cm',
    source: 'bodyMetrics.series("waistCm")',
    bodyMetric: 'waistCm',
    match: ['waist', 'waistline'],
  },
];

export function trendMetric(id: TrendMetricId): TrendMetricDef {
  const found = TREND_METRICS.find((m) => m.id === id);
  // The id type makes this unreachable through the compiler; it fires only if
  // an id is added to the union and not to the table, which is the one way
  // this registry can silently stop covering something.
  if (!found) throw new Error(`TREND_METRICS has no entry for "${id}"`);
  return found;
}
