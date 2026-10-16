/**
 * Workout CSV into local History (`.1112`).
 *
 * Session export (`set-table-b`) is the dialect. Set-table export
 * (`set-table-a`) rides the same parser. The diary export also
 * re-imports via this module. Preview never writes. Confirm
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
import {
  decideImportDiary,
  type ImportDiarySession,
} from './importDiary';

export type SessionCsvFormat = Extract<CsvFormat, 'set-table-b' | 'set-table-a'> | 'diary';

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

/** Convert ImportDiarySession to CompletedWorkoutLog */
function diarySessionToLog(
  session: ImportDiarySession,
  index: number
): CompletedWorkoutLog {
  const date = session.date;
  const startedAt = `${date}T12:00:00.000Z`;
  const completedAt = `${date}T12:00:00.000Z`;

  // Build exercises with proper structure
  // For diary format, sessionNote becomes exercise note when there's no explicit exercise note
  const exercises: CompletedWorkoutLog['exercises'] = session.exercises.map((ex) => {
    const catalog = getExerciseById(ex.exerciseId);
    return {
      exerciseId: ex.exerciseId,
      sets: ex.sets.map((set) => ({
        reps: set.reps,
        weight: set.weight,
        ...(set.kind ? { kind: set.kind } : {}),
        ...(set.rpe ? { rpe: set.rpe } : {}),
        ...(set.rpe10 ? { rpe10: set.rpe10 } : {}),
        ...(set.side ? { side: set.side } : {}),
        ...(set.durationSeconds ? { durationSeconds: set.durationSeconds } : {}),
      })),
      // Use exercise note, or fall back to session note for single-exercise sessions
      ...(ex.note ? { note: ex.note } : session.exercises.length === 1 && session.sessionNote ? { note: session.sessionNote } : {}),
      ...(catalog?.muscleGroups ? { muscleGroups: [...catalog.muscleGroups] } : {}),
    };
  });

  // Calculate total volume
  let totalVolume = 0;
  for (const ex of exercises) {
    for (const set of ex.sets) {
      if (set.kind === 'warmup') continue;
      totalVolume += (set.weight || 0) * (set.reps || 0);
    }
  }

  return {
    id: `diary-import-${index}`,
    clientId: `diary-import-${index}`,
    revision: 1,
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    workoutName: session.workoutName,
    sessionTitle: session.sessionTitle,
    startedAt,
    completedAt,
    durationSeconds: session.durationSeconds,
    sessionNote: session.sessionNote,
    exercises,
    totalVolume,
  };
}

/**
 * Detect diary export header and parse using importDiary helpers.
 * Returns null if not a diary-format file.
 */
function parseDiaryFormat(text: string): ImportSessionCsvDecision | null {
  const trimmed = text.replace(/^\uFEFF/, '').trim();
  if (!trimmed.startsWith('date,sessionTitle')) return null;

  const diaryDecision = decideImportDiary(trimmed);
  if (diaryDecision.kind !== 'ready' || diaryDecision.sessions.length === 0) {
    return { kind: 'empty', reason: 'no_rows' };
  }

  const workouts: CompletedWorkoutLog[] = diaryDecision.sessions.map((session, i) =>
    diarySessionToLog(session, i)
  );

  return {
    kind: 'ready',
    format: 'diary' as SessionCsvFormat,
    workouts,
    skippedRows: 0,
    unmatchedIds: unmatchedIds(workouts),
    setCount: workouts.reduce((n, workout) => n + countCompletedLogSets(workout), 0),
  };
}

/** Dry-run. Never writes. Format comes from the header, never the filename. */
export function decideImportSessionCsv(
  text: string | null | undefined,
  units: UnitsPref
): ImportSessionCsvDecision {
  if (text == null || text.trim() === '') return EMPTY_BLANK;

  // Try diary format first (our own export header)
  const diaryResult = parseDiaryFormat(text);
  if (diaryResult) return diaryResult;

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
