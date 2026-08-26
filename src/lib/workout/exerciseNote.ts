/**
 * Per-exercise diary — the one line they typed *this session*.
 *
 * Appearance drops a leaked prior-lift note. Last History note is not a pin
 * (`.996`) — pin lives in `exercisePin.ts`. `undefined` means unset; `''`
 * means they cleared it this session. The module never rewords and never
 * calls an LLM.
 */

import type { CompletedWorkoutLog } from '@/types';
import { lastNotesFor } from '@/lib/journal/cueMemory';

export const EXERCISE_NOTE_MAX = 200;

/**
 * Boundary parse. Empty / whitespace / non-string → `undefined`.
 * Over-cap is truncated — never padded, never invented from volume.
 * Does not call lastNotesFor / cueMemory / LLM.
 */
export function normalizeExerciseNote(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > EXERCISE_NOTE_MAX
    ? trimmed.slice(0, EXERCISE_NOTE_MAX)
    : trimmed;
}

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
 * Appearance-time wipe: drop any prior `note` (swap must not leak the old lift).
 * Last History note is not a pin (`.996`). Pin lives in `exercisePin.ts`.
 */
export function applyHistoryNote<T extends { exerciseId: string; note?: string }>(
  ex: T,
  _history?: CompletedWorkoutLog[]
): T {
  const { note: _ignored, ...rest } = ex;
  return rest as T;
}
