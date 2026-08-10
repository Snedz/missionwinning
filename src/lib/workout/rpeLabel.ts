/**
 * Athlete-facing RPE chip labels for the free logger.
 *
 * SetLogRow / SetLogTable used `defaultValue: r` and painted completed RPE as
 * raw storage ids (`med`). English floors match activeWorkoutLocales EN so
 * hydrate never shows a machine token as the chip label (.648).
 */

export type SetRpeLabel = 'easy' | 'med' | 'hard';

export function rpeLabelKey(rpe: string): string {
  if (rpe === 'easy') return 'activeRpeEasy';
  if (rpe === 'med') return 'activeRpeMed';
  if (rpe === 'hard') return 'activeRpeHard';
  return 'activeRpeMed';
}

/** English floor for t(rpeLabelKey) — never the raw storage id. */
export function rpeDefaultLabel(rpe: string): string {
  if (rpe === 'easy') return 'Easy';
  if (rpe === 'med') return 'Med';
  if (rpe === 'hard') return 'Hard';
  return 'Med';
}
