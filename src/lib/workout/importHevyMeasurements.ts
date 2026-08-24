/**
 * Hevy official measurement export → existing `bodyMetrics` store.
 *
 * Official English file is wide `measurement_data.csv` (not a long
 * name/value/unit dialect). Header locked against two real third-party
 * exports. Detection is header-only — never the filename.
 *
 * `weight_kg` is always kilograms. `fat_percent` is always a percent.
 * Circumference columns follow the athlete's Hevy length unit (`_in` / `_cm`).
 *
 * Existing native field values win. Re-import is a no-op. Unmapped
 * circumferences (neck, thigh, …) are skipped and counted, never invented
 * as new store fields.
 */

import {
  BODY_METRIC_KEYS,
  BODY_METRICS_MAX_ENTRIES,
  normalizeEntry,
  type BodyMetricEntry,
  type BodyMetricKey,
} from '@/lib/bodyMetrics';
import { compareKeys } from '@/lib/i18n/formatLocale';
import { splitCsvRecords } from '@/lib/workout/importCsv';

/** Official English Hevy measurement header (imperial circumferences). */
export const HEVY_MEASUREMENTS_CSV_HEADER =
  'date,weight_kg,fat_percent,neck_in,shoulder_in,chest_in,left_bicep_in,' +
  'right_bicep_in,left_forearm_in,right_forearm_in,abdomen_in,waist_in,' +
  'hips_in,left_thigh_in,right_thigh_in,left_calf_in,right_calf_in';

export type HevyMeasurementsError =
  | 'unrecognized_format'
  | 'no_data_rows'
  | 'missing_columns';

export interface HevyMeasurementsParseResult {
  entries: BodyMetricEntry[];
  skippedRows: number;
  error?: HevyMeasurementsError;
}

export interface BodyMetricsMergeResult {
  merged: BodyMetricEntry[];
  added: number;
  duplicates: number;
}

const IN_PER_CM = 2.54;

const MONTH: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const CIRCUMFERENCE_STEMS = new Set([
  'neck',
  'shoulder',
  'chest',
  'left_bicep',
  'right_bicep',
  'left_forearm',
  'right_forearm',
  'abdomen',
  'waist',
  'hips',
  'left_thigh',
  'right_thigh',
  'left_calf',
  'right_calf',
]);

const WORKOUT_MARKERS = ['exercise_title', 'set_index', 'start_time'];

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function headerCells(text: string): string[] {
  const first = splitCsvRecords(stripBom(text).slice(0, 8192))[0];
  if (!first) return [];
  return first.map((h) => h.trim().toLowerCase());
}

function isCircumferenceCol(col: string): boolean {
  const m = /^(.+)_(in|cm)$/.exec(col);
  return Boolean(m && CIRCUMFERENCE_STEMS.has(m[1]));
}

function hasRecognizedMetric(header: string[]): boolean {
  return header.some(
    (h) => h === 'weight_kg' || h === 'fat_percent' || isCircumferenceCol(h)
  );
}

/**
 * Header-only: Hevy measurement export, never a workout dialect.
 * A `date` + `weight_kg` file with `exercise_title` is still a workout.
 */
export function isHevyMeasurementsCsv(text: string): boolean {
  const header = headerCells(text);
  if (header.length === 0) return false;
  if (WORKOUT_MARKERS.some((m) => header.includes(m))) return false;
  if (!header.includes('date')) return false;
  return hasRecognizedMetric(header);
}

/**
 * Local calendar key from Hevy's offset-less wall clock.
 * Never `toISOString()` — that is yesterday's evening east of UTC.
 */
export function hevyMeasurementDateKey(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(t);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    const check = new Date(y, m - 1, d);
    if (
      check.getFullYear() !== y ||
      check.getMonth() !== m - 1 ||
      check.getDate() !== d
    ) {
      return null;
    }
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }
  const dmy = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/.exec(t);
  if (dmy) {
    return partsToKey(Number(dmy[3]), MONTH[dmy[2].toLowerCase()], Number(dmy[1]));
  }
  const mdy = /^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})/.exec(t);
  if (mdy) {
    return partsToKey(Number(mdy[3]), MONTH[mdy[1].toLowerCase()], Number(mdy[2]));
  }
  return null;
}

function partsToKey(
  year: number,
  month: number | undefined,
  day: number
): string | null {
  if (month == null || !Number.isInteger(day) || day < 1) return null;
  const check = new Date(year, month, day);
  if (
    check.getFullYear() !== year ||
    check.getMonth() !== month ||
    check.getDate() !== day
  ) {
    return null;
  }
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function parseNumber(raw: string | undefined): number | undefined {
  if (raw == null) return undefined;
  const t = raw.trim();
  if (t === '') return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function toCm(value: number, unit: 'in' | 'cm'): number {
  return unit === 'in' ? value * IN_PER_CM : value;
}

function countFields(entry: BodyMetricEntry): number {
  let n = 0;
  for (const key of BODY_METRIC_KEYS) {
    if (entry[key] != null) n += 1;
  }
  return n;
}

export function parseHevyMeasurementsCsv(text: string): HevyMeasurementsParseResult {
  const body = stripBom(text);
  if (!isHevyMeasurementsCsv(body)) {
    return { entries: [], skippedRows: 0, error: 'unrecognized_format' };
  }
  const records = splitCsvRecords(body);
  if (records.length < 2) {
    return { entries: [], skippedRows: 0, error: 'no_data_rows' };
  }
  const header = records[0].map((h) => h.trim().toLowerCase());
  if (!header.includes('date') || !hasRecognizedMetric(header)) {
    return { entries: [], skippedRows: 0, error: 'missing_columns' };
  }
  const idx = (name: string) => header.indexOf(name);
  const iDate = idx('date');
  const iWeight = idx('weight_kg');
  const iFat = idx('fat_percent');

  const circ: Array<{ i: number; stem: string; unit: 'in' | 'cm' }> = [];
  header.forEach((col, i) => {
    const m = /^(.+)_(in|cm)$/.exec(col);
    if (!m || !CIRCUMFERENCE_STEMS.has(m[1])) return;
    circ.push({ i, stem: m[1], unit: m[2] as 'in' | 'cm' });
  });

  const byDate = new Map<string, BodyMetricEntry>();
  let skippedRows = 0;

  for (const row of records.slice(1)) {
    const date = hevyMeasurementDateKey(row[iDate] ?? '');
    if (!date) {
      skippedRows += 1;
      continue;
    }
    const next: BodyMetricEntry = { date };
    if (iWeight >= 0) {
      const weightKg = parseNumber(row[iWeight]);
      if (row[iWeight]?.trim() && weightKg == null) {
        /* unreadable cell — counted with the row if nothing else lands */
      } else if (weightKg != null) {
        next.weightKg = weightKg;
      }
    }
    if (iFat >= 0) {
      const fat = parseNumber(row[iFat]);
      if (fat != null) next.bodyFatPct = fat;
    }

    let rightArm: number | undefined;
    let leftArm: number | undefined;
    for (const col of circ) {
      const raw = parseNumber(row[col.i]);
      if (raw == null) continue;
      const cm = toCm(raw, col.unit);
      if (col.stem === 'waist') next.waistCm = cm;
      else if (col.stem === 'chest') next.chestCm = cm;
      else if (col.stem === 'hips') next.hipCm = cm;
      else if (col.stem === 'right_bicep') rightArm = cm;
      else if (col.stem === 'left_bicep') leftArm = cm;
      /* neck / shoulder / abdomen / forearm / thigh / calf stay unmapped */
    }
    if (rightArm != null) next.armCm = rightArm;
    else if (leftArm != null) next.armCm = leftArm;

    const normalized = normalizeEntry(next);
    if (countFields(normalized) === 0) {
      skippedRows += 1;
      continue;
    }
    const existing = byDate.get(date);
    if (!existing) {
      byDate.set(date, normalized);
      continue;
    }
    for (const key of BODY_METRIC_KEYS) {
      if (existing[key] == null && normalized[key] != null) {
        existing[key] = normalized[key];
      }
    }
  }

  const entries = [...byDate.values()].sort((a, b) => compareKeys(b.date, a.date));
  if (entries.length === 0) {
    return { entries: [], skippedRows, error: 'no_data_rows' };
  }
  return { entries, skippedRows };
}

/**
 * Date + field identity. Existing native values win. New dates never evict
 * an existing row when the 200-row cap is full.
 */
export function mergeBodyMetrics(
  existing: BodyMetricEntry[],
  incoming: BodyMetricEntry[]
): BodyMetricsMergeResult {
  const byDate = new Map<string, BodyMetricEntry>();
  for (const row of existing) {
    const n = normalizeEntry(row);
    if (!n.date) continue;
    byDate.set(n.date, { ...n });
  }
  let added = 0;
  let duplicates = 0;

  for (const raw of incoming) {
    const row = normalizeEntry(raw);
    if (!row.date || countFields(row) === 0) continue;
    const cur = byDate.get(row.date);
    if (!cur) {
      if (byDate.size >= BODY_METRICS_MAX_ENTRIES) continue;
      byDate.set(row.date, { ...row });
      added += countFields(row);
      continue;
    }
    for (const key of BODY_METRIC_KEYS) {
      const next = row[key];
      if (next == null) continue;
      if (cur[key] != null) {
        duplicates += 1;
        continue;
      }
      cur[key] = next as BodyMetricEntry[BodyMetricKey];
      added += 1;
    }
  }

  const merged = [...byDate.values()].sort((a, b) => compareKeys(b.date, a.date));
  return { merged, added, duplicates };
}
