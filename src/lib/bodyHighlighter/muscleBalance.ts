/**
 * Anterior/posterior frequency for the Coach balance strip.
 *
 * Session counts are `buildMuscleHeatmap`'s — one definition, including
 * stored groups before the catalog fallback, and tombs out. This file only
 * projects the six major groups onto the highlighter's slugs.
 *
 * Display only. The week planner does not read it.
 */

import { buildMuscleHeatmap } from '@/lib/historyAnalytics';
import { MAJOR_GROUPS, type MuscleGroup } from '@/lib/muscleGroups';
import type { CompletedWorkoutLog } from '@/types';

/** Same span as History's muscle heatmap. */
export const MUSCLE_BALANCE_WINDOW_DAYS = 14;

/**
 * Slugs the MIT model can paint that correspond to a major group.
 * Forearm, adductors, abductors, head, neck, knees, and soleus are
 * not major groups, so they are not in this projection.
 */
export const HIGHLIGHTER_MUSCLES = [
  'chest',
  'trapezius',
  'upper-back',
  'lower-back',
  'front-deltoids',
  'back-deltoids',
  'biceps',
  'triceps',
  'abs',
  'obliques',
  'quadriceps',
  'hamstring',
  'gluteal',
  'calves',
] as const;

export type HighlighterMuscle = (typeof HIGHLIGHTER_MUSCLES)[number];

export const MAJOR_TO_HIGHLIGHTER: Record<MuscleGroup, readonly HighlighterMuscle[]> = {
  Chest: ['chest'],
  Back: ['trapezius', 'upper-back', 'lower-back'],
  Shoulders: ['front-deltoids', 'back-deltoids'],
  Arms: ['biceps', 'triceps'],
  Core: ['abs', 'obliques'],
  Legs: ['quadriceps', 'hamstring', 'gluteal', 'calves'],
};

export type MuscleBalanceRow = {
  name: string;
  muscles: HighlighterMuscle[];
  frequency: number;
};

/** One row per major group trained inside the window. Frequency is sessions, not sets. */
export function muscleBalanceFromHistory(
  history: readonly CompletedWorkoutLog[],
  windowDays = MUSCLE_BALANCE_WINDOW_DAYS
): MuscleBalanceRow[] {
  const cells = buildMuscleHeatmap([...history], windowDays);
  const rows: MuscleBalanceRow[] = [];
  for (const group of MAJOR_GROUPS) {
    const cell = cells.find((c) => c.group === group);
    const frequency = cell?.sessions ?? 0;
    if (frequency <= 0) continue;
    rows.push({
      name: group,
      muscles: [...MAJOR_TO_HIGHLIGHTER[group]],
      frequency,
    });
  }
  return rows;
}
