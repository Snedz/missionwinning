/**
 * Workout CSV into local History (`.1112`).
 *
 * Session export (`set-table-b`) is the dialect. Set-table export
 * (`set-table-a`) rides the same parser. Preview never writes. Confirm
 * merges; an existing session with the same minute, name, and set count wins.
 * Native MW CSV and program-log dumps stay on Account. The diary file stays
 * on `importDiary`. Empty invents nothing. No account.
 */

import { getExerciseById } from '@/data/exercises';
import type { UnitsPref } from '@/lib/units';
import { countCompletedLogSets } from '@/lib/workout/completedLogSets';
import {
  mergeImportedLogs,
  parseWorkoutCsv,
  type CsvFormat,
} from '@/lib/workout/importCsv';
import type { CompletedWorkoutLog } from '@/types';

export type SessionCsvFormat = Extract<CsvFormat, 'set-table-b' | 'set-table-a'>;

export type ImportSessionCsvDecision =
  | { kind: 'empty'; reason: 'blank' | 'unrecognized' | 'no_rows' | 'other_dialect' }
  | {
      kind: 'ready';
      format: SessionCsvFormat;
      workouts: CompletedWorkoutLog[];
      skippedRows: number;
      unmatchedIds: string[];
      setCount: number;
    };

export type ImportSessionCsvApply =
  | { kind: 'empty' }
  | { kind: 'already'; duplicates: number }
  | {
      kind: 'apply';
      next: CompletedWorkoutLog[];
      added: number;
      duplicates: number;
    };

const EMPTY_BLANK: ImportSessionCsvDecision = { kind: 'empty', reason: 'blank' };

function unmatchedIds(workouts: readonly CompletedWorkoutLog[]): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      const id = exercise.exerciseId;
      if (!id || seen.has(id) || getExerciseById(id)) continue;
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

/** Dry-run. Never writes. Format comes from the header, never the filename. */
export function decideImportSessionCsv(
  text: string | null | undefined,
  units: UnitsPref
): ImportSessionCsvDecision {
  if (text == null || text.trim() === '') return EMPTY_BLANK;
  const parsed = parseWorkoutCsv(text, units);
  if (!parsed.format || parsed.error === 'unrecognized_format') {
    return { kind: 'empty', reason: 'unrecognized' };
  }
  if (parsed.format !== 'set-table-b' && parsed.format !== 'set-table-a') {
    return { kind: 'empty', reason: 'other_dialect' };
  }
  if (parsed.error || parsed.workouts.length === 0) {
    return { kind: 'empty', reason: 'no_rows' };
  }
  return {
    kind: 'ready',
    format: parsed.format,
    workouts: parsed.workouts,
    skippedRows: parsed.skippedRows,
    unmatchedIds: unmatchedIds(parsed.workouts),
    setCount: parsed.workouts.reduce((n, workout) => n + countCompletedLogSets(workout), 0),
  };
}

/** Confirm merge. Existing history wins on the import fingerprint. */
export function decideApplySessionCsv(input: {
  history: readonly CompletedWorkoutLog[];
  parsed: ImportSessionCsvDecision;
}): ImportSessionCsvApply {
  if (input.parsed.kind !== 'ready') return { kind: 'empty' };
  const { merged, added, duplicates } = mergeImportedLogs(
    [...input.history],
    input.parsed.workouts
  );
  if (added === 0) return { kind: 'already', duplicates };
  return { kind: 'apply', next: merged, added, duplicates };
}
