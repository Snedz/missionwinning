'use client';

import { create } from 'zustand';
import { WORKOUT_STORE_KEY } from '@/lib/backup';
import { readDurableSnapshot, readJson, readRaw, remove, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { getExerciseById } from '@/data/exercises';
import { applyDeleteFinishedSession } from '@/lib/workout/deleteFinishedSession';
import { mergePersistedWorkoutState } from '@/lib/workout/workoutRecovery';
import { finishPartialFromActive, protectLiveStart } from '@/lib/workout/sessionResume';
import { generateWeek } from '@/lib/coach/planEngine';
import { loadBands } from '@/lib/coach/load';
import { computeBodyScores, computeReadiness } from '@/lib/score';
import { localWeekKey } from '@/lib/time/localDate';
import type { CoachPlan, EquipmentProfile, PlanSession } from '@/lib/coach/types';
import type { UnitsPref } from '@/lib/units';
import type { ActiveWorkout, CompletedWorkoutLog, LoggedSet, SavedWorkout } from '@/types';

const PLAN_KEY = 'mw_coach_plan';
const PLAN_SESSION_KEY = 'mw_v2_plan_session';

type Diary = {
  activeWorkout: ActiveWorkout | null;
  workoutHistory: CompletedWorkoutLog[];
  savedWorkouts: SavedWorkout[];
};

type NotebookStore = Diary & {
  ready: boolean;
  storageWarning: boolean;
  units: UnitsPref;
  plan: CoachPlan | null;
  restUntil: number;
  lastFinishedId: string | null;
  hydrate: () => void;
  start: (session?: PlanSession) => void;
  addExercise: (id: string) => void;
  logSet: (exerciseId: string, input: Pick<LoggedSet, 'reps' | 'weight' | 'durationSeconds'>) => void;
  undoSet: (exerciseId: string, setId: string) => void;
  finish: () => boolean;
  makePlan: (equipment: EquipmentProfile, days: number) => void;
  deleteWorkout: (id: string) => void;
  eraseDevice: () => boolean;
};

function initialDiary(): Diary {
  return { activeWorkout: null, workoutHistory: [], savedWorkouts: [] };
}

function storedDiary() {
  const value = readJson<{ state?: Diary; version?: number }>(WORKOUT_STORE_KEY, {});
  return value && typeof value === 'object' ? value : {};
}

function now() {
  return new Date().toISOString();
}

function updateSession(active: ActiveWorkout, exercises: ActiveWorkout['exercises']): ActiveWorkout {
  return { ...active, exercises, revision: (active.revision ?? 0) + 1, updatedAt: now() };
}

export const useNotebook = create<NotebookStore>((set, get) => {
  function persist(patch: Partial<Diary>) {
    const current = get();
    const prior = storedDiary();
    const next = {
      activeWorkout: current.activeWorkout,
      workoutHistory: current.workoutHistory,
      savedWorkouts: current.savedWorkouts,
      ...patch,
    };
    const ok = writeRaw(WORKOUT_STORE_KEY, JSON.stringify({
      ...prior,
      version: prior.version ?? 1,
      state: { ...prior.state, ...next },
    }));
    set({ ...next, storageWarning: !ok });
    return ok;
  }

  function savePlan(plan: CoachPlan) {
    const ok = writeRaw(PLAN_KEY, JSON.stringify(plan));
    set({ plan, storageWarning: !ok || get().storageWarning });
  }

  return {
    ...initialDiary(),
    ready: false,
    storageWarning: false,
    units: 'metric',
    plan: null,
    restUntil: 0,
    lastFinishedId: null,

    hydrate() {
      const current = get();
      const next = mergePersistedWorkoutState(storedDiary().state, current);
      const plan = readJson<CoachPlan | null>(PLAN_KEY, null);
      set({
        activeWorkout: next.activeWorkout ?? null,
        workoutHistory: next.workoutHistory ?? [],
        savedWorkouts: next.savedWorkouts ?? [],
        plan: plan && Array.isArray(plan.sessions) ? plan : null,
        units: readRaw(STORAGE_KEYS.units) === 'imperial' ? 'imperial' : 'metric',
        ready: true,
      });
    },

    start(session) {
      if (protectLiveStart(get().activeWorkout) === 'keep') return;
      const startedAt = now();
      const exercises: ActiveWorkout['exercises'] = session
        ? session.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          muscleGroups: getExerciseById(exercise.exerciseId)?.muscleGroups,
          prescribed: true,
          sets: Array.from({ length: exercise.sets }, () => ({
            id: crypto.randomUUID(), reps: exercise.reps, weight: exercise.weight, completed: false,
          })),
        }))
        : [{ exerciseId: 'push-ups', sets: [], muscleGroups: getExerciseById('push-ups')?.muscleGroups }];
      const clientId = crypto.randomUUID();
      persist({ activeWorkout: {
        clientId, revision: 1, workoutName: session?.name ?? 'Quick workout',
        startedAt, updatedAt: startedAt, exercises,
      } });
      if (session) writeRaw(PLAN_SESSION_KEY, JSON.stringify({ clientId, sessionId: session.id }));
      set({ restUntil: 0 });
    },

    addExercise(id) {
      const active = get().activeWorkout;
      if (!active || active.exercises.some((exercise) => exercise.exerciseId === id)) return;
      const exercise = getExerciseById(id);
      if (!exercise) return;
      persist({ activeWorkout: updateSession(active, [...active.exercises, {
        exerciseId: id, sets: [], muscleGroups: exercise.muscleGroups,
      }]) });
    },

    logSet(exerciseId, input) {
      const active = get().activeWorkout;
      if (!active) return;
      const exercises = active.exercises.map((exercise) => {
        if (exercise.exerciseId !== exerciseId) return exercise;
        const target = exercise.sets.findIndex((item) => !item.completed);
        const set: LoggedSet = {
          id: target < 0 ? crypto.randomUUID() : exercise.sets[target].id,
          ...input, completed: true, kind: 'normal',
        };
        return { ...exercise, sets: target < 0 ? [...exercise.sets, set] : exercise.sets.map((row, i) => i === target ? set : row) };
      });
      persist({ activeWorkout: updateSession(active, exercises) });
      set({ restUntil: Date.now() + 90_000 });
    },

    undoSet(exerciseId, setId) {
      const active = get().activeWorkout;
      if (!active) return;
      persist({ activeWorkout: updateSession(active, active.exercises.map((exercise) =>
        exercise.exerciseId === exerciseId
          ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== setId) }
          : exercise
      )) });
    },

    finish() {
      const { activeWorkout, workoutHistory, plan } = get();
      const result = finishPartialFromActive(activeWorkout);
      if (!result || !activeWorkout) return false;
      const id = activeWorkout.clientId ?? crypto.randomUUID();
      const completedAt = now();
      const entry: CompletedWorkoutLog = {
        id, clientId: id, revision: 1, updatedAt: completedAt, completedAt,
        startedAt: activeWorkout.startedAt, workoutName: activeWorkout.workoutName,
        ...(activeWorkout.sessionNote ? { sessionNote: activeWorkout.sessionNote } : {}),
        durationSeconds: Math.max(0, Math.round((Date.parse(completedAt) - Date.parse(activeWorkout.startedAt)) / 1000)),
        exercises: result.exercises, totalVolume: result.volume,
      };
      persist({ activeWorkout: null, workoutHistory: [entry, ...workoutHistory.filter((log) => log.clientId !== id)] });
      set({ lastFinishedId: id, restUntil: 0 });
      const selected = readJson<{ clientId: string; sessionId: string } | null>(PLAN_SESSION_KEY, null);
      if (selected?.clientId === id && plan) {
        savePlan({ ...plan, revision: plan.revision + 1, sessions: plan.sessions.map((session) =>
          session.id === selected.sessionId ? { ...session, status: 'done' } : session
        ) });
        remove(PLAN_SESSION_KEY);
      }
      return true;
    },

    makePlan(equipment, daysPerWeek) {
      const { workoutHistory, units, plan } = get();
      const history = workoutHistory.filter((entry) => !entry.deletedAt);
      savePlan(generateWeek({
        experience: 'beginner', equipment, goalId: 'strength', daysPerWeek,
        preferredDays: [], history, units, seedId: 'local',
        readiness: computeReadiness(history),
        bodyScores: computeBodyScores(history),
        loadZone: loadBands(history).zone,
      }, localWeekKey(), plan ? plan.revision + 1 : 1));
    },

    deleteWorkout(id) {
      const { workoutHistory, activeWorkout } = get();
      const result = applyDeleteFinishedSession({ sessionId: id, history: workoutHistory, live: activeWorkout });
      if (result) persist({ workoutHistory: result.history });
    },

    eraseDevice() {
      const snapshot = readDurableSnapshot('mw_', WORKOUT_STORE_KEY);
      if (!snapshot) return false;
      const results = [WORKOUT_STORE_KEY, ...Object.keys(snapshot.entries)].map(remove);
      get().hydrate();
      if (!results.every(Boolean)) return false;
      set({ ...initialDiary(), plan: null, restUntil: 0, lastFinishedId: null, storageWarning: false });
      return true;
    },
  };
});
