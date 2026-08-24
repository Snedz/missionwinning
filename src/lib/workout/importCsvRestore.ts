/**
 * The DOM half of CSV history transfer: preview (dry-run) → confirm write
 * into the persisted store, and export the current log as Strong or the
 * set-table logger CSV (0.1 beta). File pick never writes.
 *
 * Mirrors `backup.ts`'s restore path deliberately — write the zustand persist
 * payload under `WORKOUT_STORE_KEY` and let the caller refresh, rather than mutating
 * a live store mid-render. All parsing, merging, and CSV shaping is in
 * `importCsv.ts`, which is pure; this file only touches storage + the download
 * click, so the seam between "provable" and "browser-only" stays exactly where
 * `backup.ts` already drew it.
 *
 * Export reads the same persist payload import writes. Free forever — this
 * module must never consult premium. No extra surfaces: download stays on the
 * existing Profile card.
 */

import { WORKOUT_STORE_KEY } from '@/lib/backup';
import {
  BODY_METRICS_KEY,
  loadBodyMetrics,
  type BodyMetricEntry,
} from '@/lib/bodyMetrics';
import { readRaw, writeJson, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { localDateKey } from '@/lib/time/localDate';
import type { UnitsPref } from '@/lib/units';
import type { CompletedWorkoutLog } from '@/types';
import { countCompletedLogSets } from '@/lib/workout/completedLogSets';
import {
  mergeImportedLogs,
  parseWorkoutCsv,
  workoutsToSetTableACsv,
  workoutsToSetTableBCsv,
  type CsvFormat,
  type WorkoutCsvDialect,
} from '@/lib/workout/importCsv';
import {
  isHevyMeasurementsCsv,
  mergeBodyMetrics,
  parseHevyMeasurementsCsv,
} from '@/lib/workout/importHevyMeasurements';

interface PersistedWorkoutState {
  version?: number;
  state?: {
    workoutHistory?: CompletedWorkoutLog[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

export interface CsvRestoreResult {
  ok: boolean;
  error?: 'unrecognized_format' | 'no_data_rows' | 'missing_columns' | 'storage';
  format?: CsvFormat | null;
  added?: number;
  duplicates?: number;
  skippedRows?: number;
}

export type CsvExportResult =
  | { ok: true; csv: string; count: number; dialect: WorkoutCsvDialect }
  | { ok: false; error: 'storage' };

export type DiaryImportKind = 'workout' | 'measurements';

/** Dry-run of a file pick. Never writes. Confirm calls `importDiaryText`. */
export interface CsvImportPreview {
  ok: boolean;
  error?: CsvRestoreResult['error'];
  format?: CsvFormat | null;
  kind?: DiaryImportKind;
  workouts: CompletedWorkoutLog[];
  measurements: BodyMetricEntry[];
  skippedRows: number;
  added: number;
  duplicates: number;
  measurementAdded: number;
  measurementDuplicates: number;
  setCount: number;
}

export interface DiaryRestoreResult extends CsvRestoreResult {
  kind?: DiaryImportKind;
  measurementAdded?: number;
  measurementDuplicates?: number;
}

function displayUnits(): UnitsPref {
  return readRaw(STORAGE_KEYS.units) === 'imperial' ? 'imperial' : 'metric';
}

function countImportSets(workouts: CompletedWorkoutLog[]): number {
  return workouts.reduce((n, w) => n + countCompletedLogSets(w), 0);
}

function emptyPreview(
  error: CsvRestoreResult['error'],
  format: CsvFormat | null | undefined,
  skippedRows = 0,
  kind?: DiaryImportKind
): CsvImportPreview {
  return {
    ok: false,
    error,
    format,
    kind,
    workouts: [],
    measurements: [],
    skippedRows,
    added: 0,
    duplicates: 0,
    measurementAdded: 0,
    measurementDuplicates: 0,
    setCount: 0,
  };
}

function readExistingHistory():
  | { ok: true; existing: CompletedWorkoutLog[] }
  | { ok: false; error: 'storage' } {
  try {
    const raw = readRaw(WORKOUT_STORE_KEY);
    const current: PersistedWorkoutState = raw ? (JSON.parse(raw) as PersistedWorkoutState) : {};
    return { ok: true, existing: current.state?.workoutHistory ?? [] };
  } catch {
    return { ok: false, error: 'storage' };
  }
}

/** Parse + merge counts against persist. Does not write. */
export function previewWorkoutCsvText(text: string): CsvImportPreview {
  const parsed = parseWorkoutCsv(text, displayUnits());
  if (parsed.error || parsed.format === null) {
    return emptyPreview(
      (parsed.error as CsvRestoreResult['error']) ?? 'unrecognized_format',
      parsed.format,
      parsed.skippedRows,
      'workout'
    );
  }
  const history = readExistingHistory();
  if (!history.ok) {
    return emptyPreview('storage', parsed.format, parsed.skippedRows, 'workout');
  }
  const { added, duplicates } = mergeImportedLogs(history.existing, parsed.workouts);
  return {
    ok: true,
    format: parsed.format,
    kind: 'workout',
    workouts: parsed.workouts,
    measurements: [],
    skippedRows: parsed.skippedRows,
    added,
    duplicates,
    measurementAdded: 0,
    measurementDuplicates: 0,
    setCount: countImportSets(parsed.workouts),
  };
}

function previewMeasurementsText(text: string): CsvImportPreview {
  const parsed = parseHevyMeasurementsCsv(text);
  if (parsed.error) {
    return emptyPreview(parsed.error, null, parsed.skippedRows, 'measurements');
  }
  const { added, duplicates } = mergeBodyMetrics(loadBodyMetrics(), parsed.entries);
  return {
    ok: true,
    format: null,
    kind: 'measurements',
    workouts: [],
    measurements: parsed.entries,
    skippedRows: parsed.skippedRows,
    added: 0,
    duplicates: 0,
    measurementAdded: added,
    measurementDuplicates: duplicates,
    setCount: 0,
  };
}

/** Dry-run for a workout CSV or a Hevy measurements CSV. Never writes. */
export function previewDiaryImport(text: string): CsvImportPreview {
  if (isHevyMeasurementsCsv(text)) return previewMeasurementsText(text);
  return previewWorkoutCsvText(text);
}

function importMeasurementsText(text: string): DiaryRestoreResult {
  const parsed = parseHevyMeasurementsCsv(text);
  if (parsed.error) {
    return {
      ok: false,
      error: parsed.error,
      format: null,
      kind: 'measurements',
      skippedRows: parsed.skippedRows,
    };
  }
  try {
    const { merged, added, duplicates } = mergeBodyMetrics(
      loadBodyMetrics(),
      parsed.entries
    );
    if (!writeJson(BODY_METRICS_KEY, merged)) {
      return { ok: false, error: 'storage', format: null, kind: 'measurements' };
    }
    return {
      ok: true,
      format: null,
      kind: 'measurements',
      added: 0,
      duplicates: 0,
      measurementAdded: added,
      measurementDuplicates: duplicates,
      skippedRows: parsed.skippedRows,
    };
  } catch {
    return { ok: false, error: 'storage', format: null, kind: 'measurements' };
  }
}

/** Confirm write for a workout CSV or a Hevy measurements CSV. */
export function importDiaryText(text: string): DiaryRestoreResult {
  if (isHevyMeasurementsCsv(text)) return importMeasurementsText(text);
  return { ...importWorkoutCsvText(text), kind: 'workout' };
}

export function importWorkoutCsvText(text: string): CsvRestoreResult {
  const parsed = parseWorkoutCsv(text, displayUnits());
  if (parsed.error || parsed.format === null) {
    return {
      ok: false,
      error: (parsed.error as CsvRestoreResult['error']) ?? 'unrecognized_format',
      format: parsed.format,
      skippedRows: parsed.skippedRows,
    };
  }

  try {
    const raw = readRaw(WORKOUT_STORE_KEY);
    const current: PersistedWorkoutState = raw ? (JSON.parse(raw) as PersistedWorkoutState) : {};
    const existing = current.state?.workoutHistory ?? [];
    const { merged, added, duplicates } = mergeImportedLogs(existing, parsed.workouts);
    const next: PersistedWorkoutState = {
      ...current,
      version: current.version ?? 0,
      state: { ...current.state, workoutHistory: merged },
    };
    if (!writeRaw(WORKOUT_STORE_KEY, JSON.stringify(next))) {
      return { ok: false, error: 'storage', format: parsed.format };
    }
    return {
      ok: true,
      format: parsed.format,
      added,
      duplicates,
      skippedRows: parsed.skippedRows,
    };
  } catch {
    return { ok: false, error: 'storage', format: parsed.format };
  }
}

/** Pure-enough: read persist, shape CSV. No download — tests can call this.
 *  Empty history is a header-only file (`count: 0`), not an error. */
export function buildWorkoutCsvDownload(dialect: WorkoutCsvDialect): CsvExportResult {
  try {
    const raw = readRaw(WORKOUT_STORE_KEY);
    const current: PersistedWorkoutState = raw ? (JSON.parse(raw) as PersistedWorkoutState) : {};
    const existing = (current.state?.workoutHistory ?? []).filter((l) => !l.deletedAt);
    const csv =
      dialect === 'set-table-a'
        ? workoutsToSetTableACsv(existing, displayUnits())
        : workoutsToSetTableBCsv(existing, displayUnits());
    return { ok: true, csv, count: existing.length, dialect };
  } catch {
    return { ok: false, error: 'storage' };
  }
}

export function downloadWorkoutCsv(dialect: WorkoutCsvDialect): CsvExportResult {
  const built = buildWorkoutCsvDownload(dialect);
  if (!built.ok) return built;
  if (typeof document === 'undefined') return built;
  const blob = new Blob([built.csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${dialect}-history-${localDateKey()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return built;
}
