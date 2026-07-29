/**
 * The DOM half of CSV import: parse → merge into the persisted store → report.
 *
 * Mirrors `backup.ts`'s restore path deliberately — write the zustand persist
 * payload under `WORKOUT_STORE_KEY` and let the caller refresh, rather than mutating
 * a live store mid-render. All parsing and merging is in `importCsv.ts`, which is
 * pure; this file only touches storage, so the seam between "provable" and
 * "browser-only" stays exactly where `backup.ts` already drew it.
 */

import { WORKOUT_STORE_KEY } from '@/lib/backup';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import type { UnitsPref } from '@/lib/units';
import type { CompletedWorkoutLog } from '@/types';
import { mergeImportedLogs, parseWorkoutCsv, type CsvFormat } from '@/lib/workout/importCsv';

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

export function importWorkoutCsvText(text: string): CsvRestoreResult {
  const units: UnitsPref = readRaw(STORAGE_KEYS.units) === 'imperial' ? 'imperial' : 'metric';
  const parsed = parseWorkoutCsv(text, units);
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
