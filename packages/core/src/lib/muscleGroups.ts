/** Major muscle groups used for readiness scoring and Today UI. */

export const MAJOR_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'] as const;
export type MuscleGroup = (typeof MAJOR_GROUPS)[number];

export const MUSCLE_GROUP_I18N: Record<MuscleGroup, string> = {
  Chest: 'todayMuscleChest',
  Back: 'todayMuscleBack',
  Legs: 'todayMuscleLegs',
  Shoulders: 'todayMuscleShoulders',
  Arms: 'todayMuscleArms',
  Core: 'todayMuscleCore',
};

export type ReadinessStatusKey =
  | 'todayReadinessPrime'
  | 'todayReadinessRecovering'
  | 'todayReadinessGood';

export function readinessStatusKey(days: number): ReadinessStatusKey {
  if (days < 2) return 'todayReadinessRecovering';
  if (days < 4) return 'todayReadinessGood';
  return 'todayReadinessPrime';
}
