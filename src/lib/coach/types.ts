import type { MuscleGroup } from '@/lib/muscleGroups';
import type { BodyScores, ReadinessInfo } from '@/lib/score';
import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';

export type { Rpe } from '@/types';

export type EquipmentProfile = 'bodyweight' | 'dumbbells' | 'full-gym';

export type SessionKind = 'strength' | 'conditioning' | 'recovery';

export type SessionStatus = 'planned' | 'done' | 'missed' | 'swapped';

export interface PlanExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
  whyKey: string;
}

export interface PlanSession {
  id: string;
  dayOffset: number;
  kind: SessionKind;
  name: string;
  focusGroups: MuscleGroup[];
  exercises: PlanExercise[];
  estMinutes: number;
  status: SessionStatus;
}

export interface CoachPlan {
  revision: number;
  weekStart: string;
  daysPerWeek: number;
  sessions: PlanSession[];
  generatedAt: string;
  contextHash: string;
  equipmentProfile: EquipmentProfile;
}

export interface CoachContext {
  experience: 'beginner' | 'intermediate' | 'advanced';
  equipment: EquipmentProfile;
  goalId: string;
  daysPerWeek: number;
  preferredDays: number[];
  history: CompletedWorkoutLog[];
  readiness: Record<MuscleGroup, ReadinessInfo>;
  bodyScores: BodyScores;
  units: UnitsPref;
  assessmentRisk?: string;
  seedId: string;
}

export interface SplitDay {
  kind: SessionKind;
  focusGroups: MuscleGroup[];
  nameKey: string;
}
