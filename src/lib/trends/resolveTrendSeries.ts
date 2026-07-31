/**
 * A parsed question → the numbers that answer it.
 *
 * `.225` — the registry says *what* can be asked for and this says *where the
 * series comes from*. Every branch below delegates to a function that already
 * exists (`buildTodayTrends`, `bodyMetrics.series`) rather than re-deriving the
 * quantity, because a second definition of "weekly volume" is `.178` and this
 * file is the most tempting place in the codebase to mint one.
 *
 * ## It reports how much it actually had
 *
 * `askedDays` is what the athlete asked for; `points` is what exists. Asking
 * for ninety days with three logged entries must not draw a flat line back to
 * an invented zero — the app would be showing a plateau that never happened.
 * Device metrics are therefore returned at their real length and the caller is
 * told, which is the same honesty `.208`/`.223` were about: a chart is a claim.
 */

import type { CompletedWorkoutLog } from '@/types';
import { series as bodyMetricSeries } from '@/lib/bodyMetrics';
import { buildTodayTrends, lastDayBuckets } from '@/lib/todayTrends';
import { trendMetric, type TrendMetricDef } from './trendMetrics';
import type { TrendQuery } from './parseTrendQuery';

export interface TrendPoint {
  /** `YYYY-MM-DD`, the local day — never a UTC one. See `.225` in todayTrends. */
  key: string;
  label: string;
  value: number;
}

export interface ResolvedTrend {
  metric: TrendMetricDef;
  points: TrendPoint[];
  /** The window the athlete asked for. */
  askedDays: number;
  /**
   * True when fewer days of data exist than were asked for. The caller says so
   * rather than letting the axis imply a history that was never logged.
   */
  short: boolean;
}

/**
 * Daily buckets get a weekday letter at a week, a date beyond that — thirty
 * repeating "T"s is not an axis.
 */
function labelFor(key: string, windowDays: number, locale: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12);
  return windowDays <= 7
    ? date.toLocaleDateString(locale, { weekday: 'narrow' })
    : date.toLocaleDateString(locale, { month: 'numeric', day: 'numeric' });
}

export function resolveTrendSeries(
  query: TrendQuery,
  history: CompletedWorkoutLog[],
  locale = 'en'
): ResolvedTrend {
  const metric = trendMetric(query.metric);
  const days = query.windowDays;

  if (metric.bodyMetric) {
    /*
     * Body metrics are logged when the athlete steps on a scale, not daily, so
     * these are *entries* rather than buckets. Padding them to `days` would
     * draw weeks of zeroes between two real weigh-ins.
     */
    const raw = bodyMetricSeries(metric.bodyMetric, days);
    const points = raw.map((p) => ({
      key: p.date,
      label: labelFor(p.date, days, locale),
      value: p.value,
    }));
    return { metric, points, askedDays: days, short: points.length < 2 };
  }

  const trends = buildTodayTrends(history, locale, days);
  const found = trends.series.find((s) => s.id === query.metric);
  const buckets = lastDayBuckets(days, locale);
  const values = found?.values ?? [];

  const points = buckets.map((b, i) => ({
    key: b.key,
    label: labelFor(b.key, days, locale),
    value: values[i] ?? 0,
  }));

  /*
   * A daily bucket legitimately reads zero — a rest day is data, not a gap — so
   * "short" here asks whether any of the window was actually lived in, not
   * whether every bucket is filled.
   */
  return { metric, points, askedDays: days, short: points.every((p) => p.value === 0) };
}
