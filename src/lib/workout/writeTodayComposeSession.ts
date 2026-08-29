/**
 * Write today's compose session before Train opens.
 * Honor saved → repeat last → Coach peek → Just Go with last loads.
 * Sync. Hydrate must not own first paint.
 */

import { computeReadinessFromHistory } from '@/lib/readinessIndex';
import { getRecommendedFocus } from '@/lib/score';
import { peekCoachToday } from '@/lib/coach/peekCoachToday';
import { buildJustGoSession, previewJustGoForEquipment } from '@/lib/justGoSession';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw } from '@/lib/storage/safeStorage';
import { loadHomeGymKit } from '@/lib/workout/homeGymKit';
import { pickHonoredStart } from '@/lib/workout/honorSavedRoutine';
import { shouldRepeatLastOnToday } from '@/lib/workout/repeatLastSession';
import { templateSetsToLogged } from '@/lib/workout/workoutTemplate';
import {
  readSavedWorkoutsFromStorage,
  readWorkoutHistoryFromStorage,
} from '@/lib/workout/workoutPersistLite';
import { useWorkoutStore } from '@/store/workoutStore';
import type { ActiveWorkout, CompletedWorkoutLog, SavedWorkout, WorkoutExerciseTemplate } from '@/types';
import type { UnitsPref } from '@/lib/units';

export type TodayComposeTemplate = {
  name: string;
  exercises: WorkoutExerciseTemplate[];
  source: 'saved' | 'repeat_last' | 'coach' | 'just_go';
};

export function resolveTodayComposeTemplate(opts?: {
  history?: CompletedWorkoutLog[];
  saved?: SavedWorkout[];
  units?: UnitsPref;
  equipment?: string;
}): TodayComposeTemplate {
  const history = opts?.history ?? readWorkoutHistoryFromStorage();
  const saved = opts?.saved ?? readSavedWorkoutsFromStorage();
  const units =
    opts?.units ?? (readRaw(STORAGE_KEYS.units) === 'imperial' ? 'imperial' : 'metric');
  const equipment = opts?.equipment ?? (readRaw(STORAGE_KEYS.equipment) || 'full-gym');

  const honored = pickHonoredStart({ saved, history });
  if (honored) {
    return { name: honored.name, exercises: honored.exercises, source: 'saved' };
  }

  const coachPeek = peekCoachToday();
  const last = shouldRepeatLastOnToday({
    hasLiveCoach: !!(coachPeek && coachPeek.exercises.length > 0),
    history,
  });
  if (last) {
    return { name: last.name, exercises: last.exercises, source: 'repeat_last' };
  }

  const readiness = computeReadinessFromHistory(history);
  const focus = getRecommendedFocus(readiness);
  const session = buildJustGoSession({
    focus,
    readiness,
    history,
    units,
    equipment,
    homeGymKit: loadHomeGymKit(),
    coachToday: coachPeek,
  });
  if (session.exercises.length > 0) {
    return { name: session.name, exercises: session.exercises, source: 'just_go' };
  }

  const preview = previewJustGoForEquipment(equipment, units);
  return { name: preview.name, exercises: preview.exercises, source: 'just_go' };
}

/** Write today's session into the live store. No-op when a session is already open. */
export function writeTodayComposeSession(): boolean {
  const store = useWorkoutStore.getState();
  if (store.activeWorkout) return true;
  const history = store.hasHydrated ? store.workoutHistory : readWorkoutHistoryFromStorage();
  const saved = store.hasHydrated ? store.savedWorkouts : readSavedWorkoutsFromStorage();
  const template = resolveTodayComposeTemplate({ history, saved });
  store.startWorkout(template.name, template.exercises);
  return !!useWorkoutStore.getState().activeWorkout;
}

/** Display-only session so /active can paint a set table before persist. */
export function paintTodayComposeWorkout(): ActiveWorkout {
  const template = resolveTodayComposeTemplate();
  const startedAt = new Date().toISOString();
  return {
    workoutName: template.name,
    startedAt,
    exercises: template.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: templateSetsToLogged(ex),
      ...(ex.loadPct != null && ex.loadPct > 0 ? { loadPct: ex.loadPct } : {}),
      ...(ex.prescribed ? { prescribed: true } : {}),
    })),
  };
}
