import { EXERCISES } from '@/data/exercises';

export type CoachPlanEquipment = 'bodyweight' | 'dumbbells' | 'gym';

const EQUIPMENT_MATCH: Record<CoachPlanEquipment, (eq: string) => boolean> = {
  bodyweight: (eq) => /bodyweight|none|minimal/i.test(eq),
  dumbbells: (eq) => /dumbbell|bodyweight|none|minimal/i.test(eq),
  gym: () => true,
};

/** Exercise IDs the plan generator may reference (equipment-filtered). */
export function coachExerciseIdsForEquipment(equipment: CoachPlanEquipment, limit = 48): string[] {
  const match = EQUIPMENT_MATCH[equipment];
  return EXERCISES.filter((ex) => match(ex.equipment ?? ''))
    .slice(0, limit)
    .map((ex) => ex.id);
}

export function isCoachPlanExerciseId(id: string, equipment: CoachPlanEquipment): boolean {
  return coachExerciseIdsForEquipment(equipment, 500).includes(id);
}
