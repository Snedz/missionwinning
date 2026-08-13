/**
 * Garage / bodyweight swap — 1–2 original stand-ins when the machine is gone.
 * Logger + Coach session *line* action. Not a planner rewrite.
 */

import { getExerciseById } from '@/data/exercises';
import type { CoachPlan, PlanExercise } from '@/lib/coach/types';
import type { ActiveExerciseLog, Exercise, MuscleGroup } from '@/types';

/** Closed map: gym / machine / cable / barbell id → 1–2 always-loaded garage ids. */
export const GARAGE_SWAP_MAP: Readonly<Record<string, readonly [string] | readonly [string, string]>> =
  {
    'bench-press': ['push-ups', 'dips-chair'],
    'incline-bench': ['push-ups'],
    'dumbbell-press': ['push-ups'],
    'dumbbell-fly': ['push-ups'],
    'cable-crossover': ['push-ups'],
    'forced-rep-bench': ['push-ups'],
    'pyramid-bench': ['push-ups'],
    'pre-exhaust-fly': ['push-ups'],
    'overhead-press': ['pike-pushup'],
    squats: ['air-squat', 'wall-sit'],
    'front-squat': ['air-squat'],
    'rest-pause-squat': ['air-squat', 'wall-sit'],
    '20-rep-squat': ['air-squat', 'wall-sit'],
    'leg-press': ['air-squat', 'wall-sit'],
    'leg-extension': ['wall-sit', 'air-squat'],
    deadlift: ['good-morning-bw', 'glute-bridge'],
    'romanian-deadlift': ['good-morning-bw'],
    'hip-thrust': ['glute-bridge', 'single-leg-glute'],
    'kettlebell-swing': ['good-morning-bw'],
    'kettlebell-swing-2h': ['good-morning-bw'],
    'leg-curl': ['single-leg-glute', 'good-morning-bw'],
    lunges: ['step-ups'],
    'barbell-row': ['inverted-row'],
    'cable-row': ['inverted-row'],
    'lat-pulldown': ['inverted-row', 'negative-pullup'],
    'face-pull': ['band-pull-apart', 'face-pull-band'],
    'rear-delt-fly': ['band-pull-apart'],
    'tricep-pushdown': ['dips-chair'],
    'skull-crusher': ['dips-chair'],
    'triceps-extension': ['dips-chair'],
    'calf-raise': ['calf-raise-ankle-rock'],
    'seated-calf': ['calf-raise-ankle-rock'],
    'hanging-leg-raise': ['dead-bug', 'plank'],
    thruster: ['air-squat', 'jump-squats'],
    'wall-ball': ['air-squat', 'jump-squats'],
    'sled-push': ['mountain-climbers', 'jump-squats'],
    'box-jump': ['jump-squats'],
  };

const GYM_EQ = /barbell|machine|cable|sled|landmine|trap\s*bar|dumbbell|kettlebell|medicine ball|jump rope|various/i;

function normalizeEq(equipment?: string): string {
  return (equipment ?? '').trim().toLowerCase();
}

export function isGarageEquipment(equipment?: string): boolean {
  const eq = normalizeEq(equipment);
  if (!eq) return false;
  if (GYM_EQ.test(eq)) return false;
  if (eq === 'bodyweight' || eq.startsWith('bodyweight')) return true;
  if (eq.includes('chair') || eq.includes('box') || eq.includes('band') || eq.includes('table')) {
    return true;
  }
  return false;
}

export function garageEquipmentChanged(fromEq?: string, toEq?: string): boolean {
  return normalizeEq(fromEq) !== normalizeEq(toEq);
}

export function listGarageSwaps(exerciseId: string): Exercise[] {
  const ids = GARAGE_SWAP_MAP[exerciseId];
  if (!ids) return [];
  const out: Exercise[] = [];
  for (const id of ids) {
    if (id === exerciseId) continue;
    const ex = getExerciseById(id);
    if (!ex) continue;
    if (!isGarageEquipment(ex.equipment)) continue;
    out.push(ex);
    if (out.length === 2) break;
  }
  return out;
}

export function shouldShowGarageSwap(params: {
  hasCompletedSet: boolean;
  optionCount: number;
}): boolean {
  return !params.hasCompletedSet && params.optionCount > 0;
}

export function garageSwapsWhenOpen(params: {
  swapOpenIdx: number | null;
  exIdx: number;
  currentId: string;
}): Exercise[] {
  if (params.swapOpenIdx !== params.exIdx) return [];
  return listGarageSwaps(params.currentId);
}

export function applyGarageSwapToActive(params: {
  current: ActiveExerciseLog;
  nextId: string;
  nextMuscleGroups?: MuscleGroup[];
  equipmentChanged: boolean;
}): ActiveExerciseLog {
  const { current, nextId, nextMuscleGroups, equipmentChanged } = params;
  return {
    ...current,
    exerciseId: nextId,
    muscleGroups: nextMuscleGroups?.length ? [...nextMuscleGroups] : current.muscleGroups,
    loadPct: equipmentChanged ? undefined : current.loadPct,
    sets: current.sets.map((s) => ({
      ...s,
      weight: equipmentChanged ? 0 : s.weight,
    })),
  };
}

export function applyGarageSwapToPlanExercise(
  ex: PlanExercise,
  nextId: string,
  equipmentChanged: boolean
): PlanExercise {
  return {
    ...ex,
    exerciseId: nextId,
    weight: equipmentChanged ? 0 : ex.weight,
    loadPct: equipmentChanged ? undefined : ex.loadPct,
  };
}

export function swapExerciseInPlan(
  plan: CoachPlan,
  sessionId: string,
  fromExerciseId: string,
  toExerciseId: string
): CoachPlan | null {
  const session = plan.sessions.find((s) => s.id === sessionId);
  if (!session || session.status === 'done') return null;
  const allowed = listGarageSwaps(fromExerciseId);
  if (!allowed.some((e) => e.id === toExerciseId)) return null;
  const fromEx = session.exercises.find((e) => e.exerciseId === fromExerciseId);
  if (!fromEx) return null;
  const fromCatalog = getExerciseById(fromExerciseId);
  const toCatalog = getExerciseById(toExerciseId);
  if (!toCatalog) return null;
  const changed = garageEquipmentChanged(fromCatalog?.equipment, toCatalog.equipment);
  const sessions = plan.sessions.map((s) => {
    if (s.id !== sessionId) return s;
    return {
      ...s,
      exercises: s.exercises.map((e) =>
        e.exerciseId === fromExerciseId
          ? applyGarageSwapToPlanExercise(e, toExerciseId, changed)
          : e
      ),
    };
  });
  return { ...plan, sessions, revision: plan.revision + 1 };
}
