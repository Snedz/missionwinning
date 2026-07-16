/**
 * Default public steps/mistakes when enrichment omits them.
 * Server-side only path (via exerciseSeo) — keeps catalog files lean.
 */
import type { Exercise } from '@/types';
import type { ExercisePublicEnrichment } from '@/data/exercisePublicEnrichment';

export function defaultStepsForExercise(exercise: Exercise): string[] {
  const name = exercise.name;
  return [
    `Set up in a stable stance for ${name} with the intended equipment.`,
    'Brace the trunk before the first rep — ribs down, breath ready.',
    `Perform ${name} through a controlled full range you own today.`,
    'Finish the rep without bouncing or losing position.',
    'Reset brace between hard reps when the load demands it.',
  ];
}

export function defaultMistakesForExercise(exercise: Exercise): string[] {
  const primary = exercise.muscleGroups[0] || 'the target muscles';
  return [
    'Using momentum instead of control',
    `Losing tension on ${primary.toLowerCase()} at the hard part of the rep`,
    'Cutting range of motion without a planned scale',
    'Holding the breath for the entire set',
  ];
}

/** Merge authored enrichment with safe defaults for public pages. */
export function withPublicDepth(
  exercise: Exercise,
  enrichment?: ExercisePublicEnrichment
): ExercisePublicEnrichment {
  const steps = enrichment?.steps?.length
    ? enrichment.steps
    : defaultStepsForExercise(exercise);
  const mistakes = enrichment?.mistakes?.length
    ? enrichment.mistakes
    : defaultMistakesForExercise(exercise);
  return {
    ...enrichment,
    steps,
    mistakes,
    cues: enrichment?.cues,
    alternatives: enrichment?.alternatives,
    formTips: enrichment?.formTips,
    safety: enrichment?.safety,
  };
}
