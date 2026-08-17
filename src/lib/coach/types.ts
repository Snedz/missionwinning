import type { MuscleGroup } from '@/lib/muscleGroups';
import type { BodyScores, ReadinessInfo } from '@/lib/score';
import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';
import type { LoadZone } from '@/lib/coach/load';
import type { HomeGymKit } from '@/lib/workout/homeGymKit';

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
  /** Percent of working max when weight was materialized from e1RM (a team-training app-style). */
  loadPct?: number;
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
  /**
   * Local Home gym kit (`.733`). Filter-only — never a rank input.
   * Null/absent keeps the three-way `equipment` profile.
   */
  homeGymKit?: HomeGymKit | null;
  /**
   * The athlete's acute:chronic load band (`load.ts`), computed once at context build.
   * Optional so a context without it behaves exactly as it did before `.177` — which
   * is also what every athlete under 14 days of history gets, since the ratio is null
   * there and the zone is `unknown`. Only ever holds a rise; see `loadGuard.ts`.
   */
  loadZone?: LoadZone;
}

export interface SplitDay {
  kind: SessionKind;
  focusGroups: MuscleGroup[];
  nameKey: string;
}
