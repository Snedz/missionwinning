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
import { mergeWorkoutHistoriesDetailed } from '@/lib/workout/workoutMerge';
import { enqueue, getState as getOutboxState } from '@/lib/sync/outbox';
import { alignLegacyWorkouts } from '@/lib/sync/workoutCloud';
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
  owner: string | null;
  switchOwner: (owner: string | null) => void;
  mergeCloud: (owner: string, rows: CompletedWorkoutLog[]) => boolean;
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

export function notebookNamespace(owner: string | null) {
  return owner ? `v2-notebook:${owner}:` : '';
}

export function workoutQueueKey(owner: string) {
  return notebookNamespace(owner) + 'workout-queue';
}

export type WorkoutQueuePayload = {
  owner: string;
  log: CompletedWorkoutLog;
  weightUnit: 'kg' | 'lb';
};

export function queueWorkout(owner: string, log: CompletedWorkoutLog, units: UnitsPref) {
  const payload: WorkoutQueuePayload = { owner, log, weightUnit: units === 'imperial' ? 'lb' : 'kg' };
  enqueue('workout.upsert', log.clientId ?? log.id, payload, workoutQueueKey(owner));
}

function initialDiary(): Diary {
  return { activeWorkout: null, workoutHistory: [], savedWorkouts: [] };
}

function storedDiary(owner: string | null) {
  const value = readJson<{ state?: Diary; version?: number }>(notebookNamespace(owner) + WORKOUT_STORE_KEY, {});
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
    const prior = storedDiary(current.owner);
    const next = {
      activeWorkout: current.activeWorkout,
      workoutHistory: current.workoutHistory,
      savedWorkouts: current.savedWorkouts,
      ...patch,
    };
    const ok = writeRaw(notebookNamespace(current.owner) + WORKOUT_STORE_KEY, JSON.stringify({
      ...prior,
      version: prior.version ?? 1,
      state: { ...prior.state, ...next },
    }));
    set({ ...next, storageWarning: !ok });
    return ok;
  }

  function savePlan(plan: CoachPlan) {
    const ok = writeRaw(notebookNamespace(get().owner) + PLAN_KEY, JSON.stringify(plan));
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
    owner: null,

    hydrate() {
      const current = get();
      const namespace = notebookNamespace(current.owner);
      const next = mergePersistedWorkoutState(storedDiary(current.owner).state, current);
      const plan = readJson<CoachPlan | null>(namespace + PLAN_KEY, null);
      set({
        activeWorkout: next.activeWorkout ?? null,
        workoutHistory: next.workoutHistory ?? [],
        savedWorkouts: next.savedWorkouts ?? [],
        plan: plan && Array.isArray(plan.sessions) ? plan : null,
        units: (readRaw(namespace + STORAGE_KEYS.units) ?? readRaw(STORAGE_KEYS.units)) === 'imperial' ? 'imperial' : 'metric',
        ready: true,
      });
    },

    switchOwner(owner) {
      if (get().owner === owner) return;
      const namespace = notebookNamespace(owner);
      const next = mergePersistedWorkoutState(storedDiary(owner).state, initialDiary());
      const plan = readJson<CoachPlan | null>(namespace + PLAN_KEY, null);
      set({
        ...initialDiary(), ...next, owner, ready: true, restUntil: 0, lastFinishedId: null,
        plan: plan && Array.isArray(plan.sessions) ? plan : null, storageWarning: false,
        units: (readRaw(namespace + STORAGE_KEYS.units) ?? readRaw(STORAGE_KEYS.units)) === 'imperial' ? 'imperial' : 'metric',
      });
    },

    mergeCloud(owner, rows) {
      const current = get();
      if (current.owner !== owner) return false;
      const claimKey = 'v2-notebook:guest-claimed-by';
      const claim = readRaw(claimKey);
      const legacyOwner = readRaw(STORAGE_KEYS.storageOwner);
      const guest = !claim && (!legacyOwner || legacyOwner === owner)
        ? mergePersistedWorkoutState(storedDiary(null).state, initialDiary()) : null;
      const history = alignLegacyWorkouts([...current.workoutHistory, ...(guest?.workoutHistory ?? [])], rows);
      const combined = mergeWorkoutHistoriesDetailed(history, rows, Infinity);
      const local = {
        activeWorkout: current.activeWorkout ?? guest?.activeWorkout ?? null,
        savedWorkouts: Array.from(new Map([...(guest?.savedWorkouts ?? []), ...current.savedWorkouts].map((w) => [w.id, w])).values()),
        workoutHistory: combined.logs,
      };
      if (!persist(local)) return false;
      if (guest && !writeRaw(claimKey, owner)) return false;
      return true;
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
      if (session) writeRaw(notebookNamespace(get().owner) + PLAN_SESSION_KEY, JSON.stringify({ clientId, sessionId: session.id }));
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
      const stored = persist({ activeWorkout: null, workoutHistory: [entry, ...workoutHistory.filter((log) => log.clientId !== id)] });
      const { owner, units } = get();
      if (owner && stored) queueWorkout(owner, entry, units);
      set({ lastFinishedId: id, restUntil: 0 });
      const planSessionKey = notebookNamespace(get().owner) + PLAN_SESSION_KEY;
      const selected = readJson<{ clientId: string; sessionId: string } | null>(planSessionKey, null);
      if (selected?.clientId === id && plan) {
        savePlan({ ...plan, revision: plan.revision + 1, sessions: plan.sessions.map((session) =>
          session.id === selected.sessionId ? { ...session, status: 'done' } : session
        ) });
        remove(planSessionKey);
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
      const { workoutHistory, activeWorkout, owner, units } = get();
      const result = applyDeleteFinishedSession({ sessionId: id, history: workoutHistory, live: activeWorkout });
      if (result && persist({ workoutHistory: result.history }) && owner) queueWorkout(owner, result.next, units);
    },

    eraseDevice() {
      const { owner } = get();
      if (owner && (getOutboxState(workoutQueueKey(owner)).pending || getOutboxState(workoutQueueKey(owner)).stuck)) return false;
      const namespace = notebookNamespace(owner);
      const workoutKey = namespace + WORKOUT_STORE_KEY;
      const snapshot = readDurableSnapshot(namespace + 'mw_', workoutKey);
      if (!snapshot) return false;
      const results = [workoutKey, ...Object.keys(snapshot.entries)].map(remove);
      get().hydrate();
      if (!results.every(Boolean)) return false;
      set({ ...initialDiary(), plan: null, restUntil: 0, lastFinishedId: null, storageWarning: false });
      return true;
    },
  };
});
