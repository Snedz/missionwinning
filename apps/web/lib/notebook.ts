'use client';

import { create } from 'zustand';
import { WORKOUT_STORE_KEY } from '@/lib/backup';
import { readDurableSnapshot, readJson, readRaw, remove, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { getExerciseById } from '@/data/exercises';
import { applyDeleteFinishedSession } from '@/lib/workout/deleteFinishedSession';
import { mergePersistedWorkoutState } from '@/lib/workout/workoutRecovery';
import { finishPartialFromActive, protectLiveStart } from '@/lib/workout/sessionResume';
import { generateNotebookWeek } from '@/lib/coach/notebookWeek';
import { mergeWorkoutHistoriesDetailed } from '@/lib/workout/workoutMerge';
import { enqueue, getState as getOutboxState } from '@/lib/sync/outbox';
import { alignLegacyWorkouts } from '@/lib/sync/workoutCloud';
import type { CoachPlan, EquipmentProfile, PlanSession } from '@/lib/coach/types';
import { convertWeight, weightUnitFor, type UnitsPref } from '@/lib/units';
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
  mergeCloudContent: (owner: string, plan: CoachPlan | null, templates: SavedWorkout[]) => boolean;
  hydrate: () => void;
  start: (session?: PlanSession) => void;
  startSaved: (template: SavedWorkout) => void;
  addExercise: (id: string) => void;
  logSet: (exerciseId: string, input: Pick<LoggedSet, 'reps' | 'weight' | 'durationSeconds'>) => boolean;
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
  const payload: WorkoutQueuePayload = { owner, log, weightUnit: log.weightUnit ?? weightUnitFor(units) };
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

  function savePlan(plan: CoachPlan, queue = false) {
    const { owner } = get();
    const ok = writeRaw(notebookNamespace(owner) + PLAN_KEY, JSON.stringify(plan));
    if (ok && owner && queue) enqueue('coach.plan', 'plan', { owner, plan }, workoutQueueKey(owner));
    set({ plan, storageWarning: !ok || get().storageWarning });
    return ok;
  }

  function startWorkout(workoutName: string, exercises: ActiveWorkout['exercises']) {
    const startedAt = now();
    const clientId = crypto.randomUUID();
    persist({ activeWorkout: {
      clientId, revision: 1, workoutName, weightUnit: weightUnitFor(get().units),
      startedAt, updatedAt: startedAt, exercises,
    } });
    set({ restUntil: 0 });
    return clientId;
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
      const guestUnit = readRaw(STORAGE_KEYS.units) === 'imperial' ? 'lb' : 'kg';
      const guestHistory = (guest?.workoutHistory ?? []).map<CompletedWorkoutLog>((log) =>
        log.weightUnit ? log : { ...log, weightUnit: guestUnit });
      const history = alignLegacyWorkouts([...current.workoutHistory, ...guestHistory], rows);
      const combined = mergeWorkoutHistoriesDetailed(history, rows, Infinity, true);
      const local = {
        activeWorkout: current.activeWorkout ?? (guest?.activeWorkout ? {
          ...guest.activeWorkout, weightUnit: guest.activeWorkout.weightUnit ?? guestUnit,
        } : null),
        savedWorkouts: Array.from(new Map([...(guest?.savedWorkouts ?? []), ...current.savedWorkouts].map((w) => [w.id, w])).values()),
        workoutHistory: combined.logs,
      };
      if (!persist(local)) return false;
      const guestPlan = guest && !current.plan ? readJson<CoachPlan | null>(PLAN_KEY, null) : null;
      if (guestPlan && Array.isArray(guestPlan.sessions) &&
        !savePlan({ ...guestPlan, weightUnit: guestPlan.weightUnit ?? guestUnit })) return false;
      if (guest && !writeRaw(claimKey, owner)) return false;
      return true;
    },

    mergeCloudContent(owner, nextPlan, templates) {
      if (get().owner !== owner) return false;
      return persist({ savedWorkouts: templates }) && (!nextPlan || nextPlan === get().plan || savePlan(nextPlan));
    },

    start(session) {
      if (protectLiveStart(get().activeWorkout) === 'keep') return;
      const unit = weightUnitFor(get().units);
      const planUnit = get().plan?.weightUnit ?? unit;
      const exercises: ActiveWorkout['exercises'] = session
        ? session.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          muscleGroups: getExerciseById(exercise.exerciseId)?.muscleGroups,
          prescribed: true,
          sets: Array.from({ length: exercise.sets }, () => ({
            id: crypto.randomUUID(), reps: exercise.reps,
            weight: Math.round(convertWeight(exercise.weight, planUnit, unit) * 100) / 100, completed: false,
          })),
        }))
        : [{ exerciseId: 'push-ups', sets: [], muscleGroups: getExerciseById('push-ups')?.muscleGroups }];
      const clientId = startWorkout(session?.name ?? 'Quick workout', exercises);
      if (session) writeRaw(notebookNamespace(get().owner) + PLAN_SESSION_KEY, JSON.stringify({ clientId, sessionId: session.id }));
    },

    startSaved(template) {
      if (protectLiveStart(get().activeWorkout) === 'keep' || !template.exercises.length) return;
      startWorkout(template.name, template.exercises.map((exercise) => ({
        ...exercise, prescribed: true, muscleGroups: getExerciseById(exercise.exerciseId)?.muscleGroups,
        sets: exercise.sets.map((set) => ({ ...set, id: crypto.randomUUID(), completed: false })),
      })));
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
      if (!active?.exercises.some((exercise) => exercise.exerciseId === exerciseId)) return false;
      const exercises = active.exercises.map((exercise) => {
        if (exercise.exerciseId !== exerciseId) return exercise;
        const target = exercise.sets.findIndex((item) => !item.completed);
        const set: LoggedSet = {
          id: target < 0 ? crypto.randomUUID() : exercise.sets[target].id,
          ...input, completed: true, kind: 'normal',
        };
        return { ...exercise, sets: target < 0 ? [...exercise.sets, set] : exercise.sets.map((row, i) => i === target ? set : row) };
      });
      const saved = persist({ activeWorkout: updateSession(active, exercises) });
      set({ restUntil: Date.now() + 90_000 });
      return saved;
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
      const { activeWorkout, workoutHistory, plan, owner, units } = get();
      const result = finishPartialFromActive(activeWorkout);
      if (!result || !activeWorkout) return false;
      const id = activeWorkout.clientId ?? crypto.randomUUID();
      const completedAt = now();
      const entry: CompletedWorkoutLog = {
        id, clientId: id, revision: 1, updatedAt: completedAt, completedAt,
        weightUnit: activeWorkout.weightUnit ?? weightUnitFor(units),
        startedAt: activeWorkout.startedAt, workoutName: activeWorkout.workoutName,
        ...(activeWorkout.sessionNote ? { sessionNote: activeWorkout.sessionNote } : {}),
        durationSeconds: Math.max(0, Math.round((Date.parse(completedAt) - Date.parse(activeWorkout.startedAt)) / 1000)),
        exercises: result.exercises, totalVolume: result.volume,
      };
      const stored = persist({ activeWorkout: null, workoutHistory: [entry, ...workoutHistory.filter((log) => log.clientId !== id)] });
      if (owner && stored) queueWorkout(owner, entry, units);
      set({ lastFinishedId: id, restUntil: 0 });
      const planSessionKey = notebookNamespace(get().owner) + PLAN_SESSION_KEY;
      const selected = readJson<{ clientId: string; sessionId: string } | null>(planSessionKey, null);
      if (selected?.clientId === id && plan) {
        savePlan({ ...plan, revision: plan.revision + 1, sessions: plan.sessions.map((session) =>
          session.id === selected.sessionId ? { ...session, status: 'done' } : session
        ) }, true);
        remove(planSessionKey);
      }
      return true;
    },

    makePlan(equipment, daysPerWeek) {
      const { workoutHistory, units, plan } = get();
      savePlan(generateNotebookWeek({
        equipment, daysPerWeek, units, history: workoutHistory, revision: (plan?.revision ?? 0) + 1,
      }), true);
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
      const results = [workoutKey, ...Object.keys(snapshot.entries), ...(!owner ? [STORAGE_KEYS.landingFirstSavedSet] : [])].map(remove);
      get().hydrate();
      if (!results.every(Boolean)) return false;
      set({ ...initialDiary(), plan: null, restUntil: 0, lastFinishedId: null, storageWarning: false });
      return true;
    },
  };
});
