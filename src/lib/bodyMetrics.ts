/**
 * Local-first body metrics (weight, body fat, circumferences).
 * Storage: localStorage mw_body_metrics. Included in JSON backup.
 */

export const BODY_METRICS_KEY = 'mw_body_metrics';
const MAX_ENTRIES = 200;

export type BodyMetricEntry = {
  date: string; // YYYY-MM-DD
  weightKg?: number;
  bodyFatPct?: number;
  waistCm?: number;
  chestCm?: number;
  armCm?: number;
  hipCm?: number;
  note?: string;
};

export type BodyMetricKey =
  | 'weightKg'
  | 'bodyFatPct'
  | 'waistCm'
  | 'chestCm'
  | 'armCm'
  | 'hipCm';

export const BODY_METRIC_KEYS: BodyMetricKey[] = [
  'weightKg',
  'bodyFatPct',
  'waistCm',
  'chestCm',
  'armCm',
  'hipCm',
];

function clamp(n: number, min: number, max: number): number | undefined {
  if (!Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, n));
}

export function normalizeEntry(raw: BodyMetricEntry): BodyMetricEntry {
  return {
    date: raw.date.slice(0, 10),
    weightKg: raw.weightKg != null ? clamp(raw.weightKg, 20, 400) : undefined,
    bodyFatPct: raw.bodyFatPct != null ? clamp(raw.bodyFatPct, 1, 70) : undefined,
    waistCm: raw.waistCm != null ? clamp(raw.waistCm, 30, 250) : undefined,
    chestCm: raw.chestCm != null ? clamp(raw.chestCm, 30, 250) : undefined,
    armCm: raw.armCm != null ? clamp(raw.armCm, 10, 80) : undefined,
    hipCm: raw.hipCm != null ? clamp(raw.hipCm, 30, 250) : undefined,
    note: raw.note?.trim().slice(0, 200) || undefined,
  };
}

export function loadBodyMetrics(): BodyMetricEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const all = JSON.parse(localStorage.getItem(BODY_METRICS_KEY) || '[]') as BodyMetricEntry[];
    if (!Array.isArray(all)) return [];
    return all
      .filter((e) => e && typeof e.date === 'string')
      .map(normalizeEntry)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

export function saveBodyMetric(entry: BodyMetricEntry): BodyMetricEntry {
  const normalized = normalizeEntry(entry);
  if (typeof window === 'undefined') return normalized;
  const all = loadBodyMetrics().filter((e) => e.date !== normalized.date);
  const next = [normalized, ...all].slice(0, MAX_ENTRIES);
  localStorage.setItem(BODY_METRICS_KEY, JSON.stringify(next));
  return normalized;
}

export function latest(): BodyMetricEntry | null {
  return loadBodyMetrics()[0] ?? null;
}

/** Delta of metric vs entry ~days ago (positive = increase). */
export function delta(metric: BodyMetricKey, days = 7): number | null {
  const all = loadBodyMetrics();
  if (!all.length) return null;
  const latestVal = all[0][metric];
  if (latestVal == null) return null;
  const cutoff = Date.now() - days * 86400000;
  const older = all.find((e) => {
    const t = Date.parse(e.date);
    return Number.isFinite(t) && t <= cutoff && e[metric] != null;
  });
  if (!older || older[metric] == null) return null;
  return Math.round((latestVal - (older[metric] as number)) * 10) / 10;
}

export function series(
  metric: BodyMetricKey,
  limit = 30
): Array<{ date: string; value: number }> {
  return loadBodyMetrics()
    .filter((e) => e[metric] != null)
    .slice(0, limit)
    .map((e) => ({ date: e.date, value: e[metric] as number }))
    .reverse(); // chronological for charts
}
