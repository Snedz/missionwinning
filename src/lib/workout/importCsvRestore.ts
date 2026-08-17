/**
 * The DOM half of CSV history transfer: parse → merge into the persisted store,
 * and export the current log as Strong or the set-table logger CSV (0.1 beta).
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
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { localDateKey } from '@/lib/time/localDate';
import type { UnitsPref } from '@/lib/units';
import type { CompletedWorkoutLog } from '@/types';
import {
  mergeImportedLogs,
  parseWorkoutCsv,
  workoutsToSetTableACsv,
  workoutsToSetTableBCsv,
  type CsvFormat,
  type WorkoutCsvDialect,
} from '@/lib/workout/importCsv';

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
  | { ok: false; error: 'empty' | 'storage' };

function displayUnits(): UnitsPref {
  return readRaw(STORAGE_KEYS.units) === 'imperial' ? 'imperial' : 'metric';
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

/** Pure-enough: read persist, shape CSV. No download — tests can call this. */
export function buildWorkoutCsvDownload(dialect: WorkoutCsvDialect): CsvExportResult {
  try {
    const raw = readRaw(WORKOUT_STORE_KEY);
    const current: PersistedWorkoutState = raw ? (JSON.parse(raw) as PersistedWorkoutState) : {};
    const existing = (current.state?.workoutHistory ?? []).filter((l) => !l.deletedAt);
    if (existing.length === 0) return { ok: false, error: 'empty' };
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
