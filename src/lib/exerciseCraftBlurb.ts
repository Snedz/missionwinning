/**
 * One-line index card body for the craft library.
 * Prefers exercise cues; falls back to pattern + equipment + muscles.
 */
import type { Exercise } from '@/types';
import { inferFormPattern } from '@/lib/formPatterns';
import { PATTERN_FILTER_LABELS } from '@/lib/libraryFilters';

/** First sentence-ish from free-form cues (index card density). */
export function exerciseCraftBlurb(exercise: Exercise): string {
  const cues = exercise.cues?.trim();
  if (cues) {
    const first = cues.split(/[.;]+/).map((s) => s.trim()).find(Boolean);
    if (first && first.length >= 12) {
      return first.length > 120 ? `${first.slice(0, 117)}…` : first;
    }
  }
  const pattern = inferFormPattern(exercise.id, exercise);
  const patternLabel = pattern ? PATTERN_FILTER_LABELS[pattern] : 'Movement';
  const equip = exercise.equipment?.trim() || 'various equipment';
  const muscles = exercise.muscleGroups.slice(0, 2).join(' · ') || 'full body';
  return `${patternLabel} pattern · ${muscles} · ${equip}`;
}
