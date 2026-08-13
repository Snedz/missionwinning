/**
 * Per-exercise diary cue — the one line the athlete typed last time.
 *
 * Seed only at appearance (start / add / swap). `undefined` means unset and
 * may take the last persisted cue; `''` means they cleared it this session
 * and must not be overwritten. The module never rewords and never calls an LLM.
 */

import type { CompletedWorkoutLog } from '@/types';
import { lastNotesFor } from '@/lib/journal/cueMemory';

export const EXERCISE_NOTE_MAX = 200;

export function seedExerciseNote(
  current: string | undefined,
  last: string | undefined
): string | undefined {
  if (current !== undefined) return current;
  const text = last?.trim();
  if (!text) return undefined;
  return text.length > EXERCISE_NOTE_MAX ? text.slice(0, EXERCISE_NOTE_MAX) : text;
}

export function noteFromHistory(
  exerciseId: string,
  history: CompletedWorkoutLog[]
): string | undefined {
  return lastNotesFor(exerciseId, history)[0]?.text;
}

/**
 * Appearance-time seed: drop any prior `note` (swap must not leak the old lift)
 * and write the last cue for *this* `exerciseId`, or omit the field.
 */
export function applyHistoryNote<T extends { exerciseId: string; note?: string }>(
  ex: T,
  history: CompletedWorkoutLog[]
): T {
  const { note: _ignored, ...rest } = ex;
  const seeded = seedExerciseNote(undefined, noteFromHistory(ex.exerciseId, history));
  return (seeded !== undefined ? { ...rest, note: seeded } : rest) as T;
}
