/** Portable coach types — keep in sync with src/lib/coach/types.ts (engine fields). */

export type EquipmentProfile = 'bodyweight' | 'dumbbells' | 'full-gym';

export type SessionKind = 'strength' | 'conditioning' | 'recovery';

export type SessionStatus = 'planned' | 'done' | 'missed' | 'swapped';

export interface PlanExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
  whyKey: string;
  loadPct?: number;
}

export interface PlanSession {
  id: string;
  dayOffset: number;
  kind: SessionKind;
  name: string;
  focusGroups: string[];
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

export const COACH_PLAN_KEY = 'mw_coach_plan';
export const COACH_TASTER_KEY = 'mw_coach_taster_used';
export const DEVICE_ID_KEY = 'mw_device_id';
export const WORKOUT_HISTORY_KEY = 'mw_workout_history';
export const IDAY_DONE_KEY = 'mw_iday_done';

/** Pick higher-revision plan (cloud vs local merge). */
export function mergePlans(a: CoachPlan | null, b: CoachPlan | null): CoachPlan | null {
  if (!a) return b;
  if (!b) return a;
  return a.revision >= b.revision ? a : b;
}

/** ISO date (YYYY-MM-DD) for Monday of the week containing `d`. */
export function weekStartMonday(d = new Date()): string {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}
