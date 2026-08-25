/**
 * Quiet last-vs-this on a week-strip Track day.
 *
 * Two same-metric diary numbers or nothing. Not a sparkline. Not a
 * shame slope. `/track` stays the diary.
 */

import type { BodyMetricEntry, BodyMetricKey } from '@/lib/bodyMetrics';
import { entryHasLoggedNumber } from '@/lib/quietTrack';
import type { UnitsPref } from '@/lib/units';
import { kgToDisplay } from '@/lib/units';

const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Weight first, then tape. Body fat is not tape — skip it on the strip. */
export const STRIP_TREND_METRICS = [
  'weightKg',
  'waistCm',
  'chestCm',
  'armCm',
  'hipCm',
] as const;

export type QuietWeekTrackTrendMetric = (typeof STRIP_TREND_METRICS)[number];

export type QuietWeekTrackTrend = {
  date: string;
  metric: QuietWeekTrackTrendMetric;
  last: number;
  thisValue: number;
};

export type QuietWeekTrackTrendInput = {
  entries: readonly BodyMetricEntry[];
  date: string;
};

function localDate(raw: string | undefined): string {
  const date = String(raw ?? '').slice(0, 10);
  return LOCAL_DATE.test(date) ? date : '';
}

function loggedValue(
  entry: BodyMetricEntry,
  metric: QuietWeekTrackTrendMetric
): number | undefined {
  const value = entry[metric];
  if (value == null || !Number.isFinite(value) || value <= 0) return undefined;
  return value;
}

function pickMetric(
  thisEntry: BodyMetricEntry,
  lastEntry: BodyMetricEntry
): QuietWeekTrackTrendMetric | null {
  for (const metric of STRIP_TREND_METRICS) {
    if (loggedValue(thisEntry, metric) != null && loggedValue(lastEntry, metric) != null) {
      return metric;
    }
  }
  return null;
}

function datedEntries(entries: readonly BodyMetricEntry[]): BodyMetricEntry[] {
  const out: BodyMetricEntry[] = [];
  for (const entry of entries) {
    const date = localDate(entry.date);
    if (!date) continue;
    if (!entryHasLoggedNumber(entry)) continue;
    out.push({ ...entry, date });
  }
  return out;
}

/**
 * Rest-day dates that already have a Track number. Glance paints Scale
 * from the diary so a `/track` log does not vanish from This week.
 */
export function trackQuietDateKeys(entries: readonly BodyMetricEntry[]): Set<string> {
  const keys = new Set<string>();
  for (const entry of datedEntries(entries)) keys.add(entry.date);
  return keys;
}

/**
 * Last → this on `date` when a previous same-metric row exists.
 * Empty / one log / no overlap invents nothing.
 */
export function decideQuietWeekTrackTrend(
  input: QuietWeekTrackTrendInput
): QuietWeekTrackTrend | null {
  const date = localDate(input.date);
  if (!date) return null;
  const entries = datedEntries(input.entries);
  const thisEntry = entries.find((entry) => entry.date === date);
  if (!thisEntry) return null;
  const earlier = entries
    .filter((entry) => entry.date < date)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  for (const lastEntry of earlier) {
    const metric = pickMetric(thisEntry, lastEntry);
    if (!metric) continue;
    const last = loggedValue(lastEntry, metric);
    const thisValue = loggedValue(thisEntry, metric);
    if (last == null || thisValue == null) continue;
    return { date, metric, last, thisValue };
  }
  return null;
}

function displayNumber(metric: BodyMetricKey, value: number, units: UnitsPref): string {
  const n = metric === 'weightKg' ? Math.round(kgToDisplay(value, units) * 10) / 10 : value;
  return String(n);
}

/** Neutral last → this. No unit suffix. No up/down verdict. */
export function formatQuietWeekTrackTrend(
  trend: QuietWeekTrackTrend,
  units: UnitsPref = 'metric'
): string {
  const last = displayNumber(trend.metric, trend.last, units);
  const current = displayNumber(trend.metric, trend.thisValue, units);
  return `${last} → ${current}`;
}
