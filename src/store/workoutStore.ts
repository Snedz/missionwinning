/**
 * Zustand store — active workout, history, saved templates, rest timer.
 * Consumers: ActiveWorkoutPage, BuilderPage, HomePage
 * See: src/store/INDEX.md
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateVolume } from "@/lib/utils";
import type {
  ActiveWorkout,
  CompletedWorkoutLog,
  LoggedSet,
  SavedWorkout,
  SetKind,
  WorkoutExerciseTemplate,
} from "@/types";
import { countsTowardVolume } from "@/lib/workout/setKind";
import { advanceAfterLog } from "@/lib/workout/superset";
import { getUserWorkoutHistory, getUserWorkoutsUpdatedSince, getUser } from "@/lib/supabase";
import { recordWorkoutCompleted } from "@/lib/challenges";
import { scheduleLeaderboardPush } from "@/lib/leaderboardSync";
import { mapCloudToLocal, mergeWorkoutHistoriesDetailed } from "@/lib/workout/workoutMerge";
import { track } from "@/lib/analytics";
import { setActiveWorkoutFlag } from "@/lib/workout/activeWorkoutPulse";
import { enqueueWorkoutUpsert } from "@/lib/sync/workoutSync";
import { flush as flushOutbox } from "@/lib/sync/outbox";
import { newClientId } from "@/lib/workout/clientId";
import { readRaw, writeRaw } from "@/lib/storage/safeStorage";
import { STORAGE_KEYS } from "@/lib/storage/keys";

const DEFAULT_REST_SECONDS = 30;

/**
 * Set by `onRehydrateStorage`. Declared before `create()` on purpose: with a
 * synchronous storage zustand invokes that callback while `create()` is still
 * running, so anything it touches must already be initialised.
 */
let rehydrateSettled = false;

function syncActiveFlag(active: { exercises?: unknown } | null | undefined) {
  setActiveWorkoutFlag(!!active);
}

interface WorkoutState {
  savedWorkouts: SavedWorkout[];
  workoutHistory: CompletedWorkoutLog[];
  activeWorkout: ActiveWorkout | null;
  restSecondsRemaining: number;
  restTimerActive: boolean;
  restTimerInitialSeconds: number;
  elapsedSeconds: number;
  /** False until persist finishes merging localStorage (avoids Start wipe race). */
  hasHydrated: boolean;

  addSavedWorkout: (workout: Omit<SavedWorkout, "id" | "createdAt">) => void;
  deleteSavedWorkout: (id: string) => void;
  startWorkout: (name: string, exercises: WorkoutExerciseTemplate[], workoutId?: string) => void;
  startEmptyWorkout: () => void;
  cancelActiveWorkout: () => void;
  completeActiveWorkout: () => CompletedWorkoutLog | null;
  addExerciseToActive: (exerciseId: string, muscleGroups?: import('@/types').MuscleGroup[]) => void;
  logSet: (
    exerciseIndex: number,
    setIndex: number,
    reps: number,
    weight: number,
    rpe?: 'easy' | 'med' | 'hard',
    isPr?: boolean
  ) => void;
  logSetAndAdvance: (
    exerciseIndex: number,
    setIndex: number,
    reps: number,
    weight: number,
    isPr?: boolean
  ) => { exerciseIndex: number; setIndex: number } | null;
  rateSet: (exerciseIndex: number, setIndex: number, rpe: 'easy' | 'med' | 'hard') => void;
  setSetKind: (exerciseIndex: number, setIndex: number, kind: SetKind) => void;
  toggleSupersetWithNext: (exerciseIndex: number) => void;
  unlinkSuperset: (exerciseIndex: number) => void;
  addSetToExercise: (exerciseIndex: number) => void;
  /** Removes the last not-yet-completed set (planned-too-many case). */
  removeLastPlannedSet: (exerciseIndex: number) => void;
  removeExerciseFromActive: (exerciseIndex: number) => void;
  /** Swap to a different exercise — only while no sets are completed. */
  replaceExerciseInActive: (
    exerciseIndex: number,
    newExerciseId: string,
    muscleGroups?: import('@/types').MuscleGroup[]
  ) => void;
  setExerciseNote: (exerciseIndex: number, note: string) => void;
  /** Session-level jot — becomes journal fragments at finish, never syncs. */
  setSessionNote: (note: string) => void;
  startRestTimer: (seconds?: number) => void;
  adjustRestTimer: (delta: number) => void;
  tickRestTimer: () => void;
  stopRestTimer: () => void;
  tickElapsed: () => void;
  getRecentHistory: (limit?: number) => CompletedWorkoutLog[];
  loadFromCloud: () => Promise<void>;
  syncCurrentHistoryToCloud: () => Promise<void>;
}

import { templateSetsToLogged } from '@/lib/workout/workoutTemplate';
import { materializeTemplates } from '@/lib/workout/materializeProgram';

function createLoggedSets(count: number, reps = 10, weight = 0): LoggedSet[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    id: `set-${now}-${i}`,
    reps,
    weight,
    completed: false,
    kind: 'normal' as SetKind,
  }));
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
      restSecondsRemaining: 0,
      restTimerActive: false,
      restTimerInitialSeconds: 90,
      elapsedSeconds: 0,
      hasHydrated: false,

      addSavedWorkout: (workout) => {
        const newWorkout: SavedWorkout = {
          ...workout,
          id: `workout-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ savedWorkouts: [...s.savedWorkouts, newWorkout] }));
      },

      deleteSavedWorkout: (id) => {
        set((s) => ({
          savedWorkouts: s.savedWorkouts.filter((w) => w.id !== id),
        }));
      },

      startWorkout: (name, exercises, workoutId) => {
        // %-authored program sets resolve against the athlete's history at start
        // time, so a saved cycle keeps its percentages and re-anchors each run.
        const units = readRaw(STORAGE_KEYS.units) === 'imperial' ? 'imperial' : 'metric';
        const resolved = materializeTemplates(exercises, get().workoutHistory, units);
        const active: ActiveWorkout = {
          workoutId,
          workoutName: name,
          startedAt: new Date().toISOString(),
          exercises: resolved.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: templateSetsToLogged(ex),
            ...(ex.loadPct != null && ex.loadPct > 0 ? { loadPct: ex.loadPct } : {}),
            ...(ex.prescribed ? { prescribed: true } : {}),
          })),
        };
        syncActiveFlag(active);
        set({
          activeWorkout: active,
          elapsedSeconds: 0,
          restSecondsRemaining: 0,
          restTimerActive: false,
          restTimerInitialSeconds: 90,
        });
      },

      startEmptyWorkout: () => {
        const active = {
          workoutName: "Quick Workout",
          startedAt: new Date().toISOString(),
          exercises: [] as ActiveWorkout['exercises'],
        };
        syncActiveFlag(active);
        set({
          activeWorkout: active,
          elapsedSeconds: 0,
          restSecondsRemaining: 0,
          restTimerActive: false,
          restTimerInitialSeconds: 90,
        });
      },

      cancelActiveWorkout: () => {
        syncActiveFlag(null);
        set({
          activeWorkout: null,
          elapsedSeconds: 0,
          restSecondsRemaining: 0,
          restTimerActive: false,
          restTimerInitialSeconds: 90,
        });
      },

      completeActiveWorkout: () => {
        const { activeWorkout, elapsedSeconds } = get();
        if (!activeWorkout) return null;

        // Prefer muscle groups already on the active log (set when exercise was added).
        // Avoid importing the full exercise catalog into every page that uses this store.
        const exercises = activeWorkout.exercises
          .map((ex) => {
            return {
              exerciseId: ex.exerciseId,
              sets: ex.sets
                .filter((s) => s.completed)
                .map((s) => ({
                  reps: s.reps,
                  weight: s.weight,
                  kind: s.kind ?? 'normal',
                  rpe: s.rpe,
                })),
              ...(ex.note?.trim() ? { note: ex.note.trim() } : {}),
              ...(ex.muscleGroups?.length ? { muscleGroups: [...ex.muscleGroups] } : {}),
            };
          })
          .filter((ex) => ex.sets.length > 0);

        if (exercises.length === 0) {
          syncActiveFlag(null);
          set({ activeWorkout: null, elapsedSeconds: 0 });
          return null;
        }

        const allSets = exercises.flatMap((e) => e.sets).filter((s) => countsTowardVolume(s.kind));
        const completedAt = new Date().toISOString();
        const log: CompletedWorkoutLog = {
          id: `log-${Date.now()}`,
          clientId: newClientId(),
          revision: 1,
          updatedAt: completedAt,
          workoutName: activeWorkout.workoutName,
          startedAt: activeWorkout.startedAt,
          completedAt,
          durationSeconds: elapsedSeconds,
          exercises,
          totalVolume: calculateVolume(allSets),
        };

        const isFirstWorkout = get().workoutHistory.length === 0;

        syncActiveFlag(null);
        set((s) => ({
          workoutHistory: [log, ...s.workoutHistory],
          activeWorkout: null,
          elapsedSeconds: 0,
          restSecondsRemaining: 0,
          restTimerActive: false,
          restTimerInitialSeconds: 90,
        }));

        recordWorkoutCompleted(log);

        if (isFirstWorkout) track("first_workout_completed");
        track("workout_completed", {
          sets: allSets.length,
          volume: log.totalVolume,
          durationMin: Math.round(log.durationSeconds / 60),
        });

        const savedCount = get().savedWorkouts.length;
        scheduleLeaderboardPush(get().workoutHistory, savedCount);

        // Cloud write goes to the durable outbox: it survives this tab closing,
        // retries with backoff, and cannot duplicate the row (keyed on clientId).
        // The log is already in local persist, so nothing here can lose it.
        enqueueWorkoutUpsert(log);

        return log;
      },

      addExerciseToActive: (exerciseId, muscleGroups) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          return {
            activeWorkout: {
              ...s.activeWorkout,
              exercises: [
                ...s.activeWorkout.exercises,
                {
                  exerciseId,
                  sets: createLoggedSets(3),
                  ...(muscleGroups?.length ? { muscleGroups: [...muscleGroups] } : {}),
                },
              ],
            },
          };
        });
      },

      logSet: (exerciseIndex, setIndex, reps, weight, rpe, isPr) => {
        // Time-to-first-set is the one number that says whether the first 90
        // seconds works. Fire once, on the very first set this device ever logs.
        const before = get();
        const isFirstEverSet =
          before.workoutHistory.length === 0 &&
          !before.activeWorkout?.exercises.some((ex) => ex.sets.some((x) => x.completed));

        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = { ...exercises[exerciseIndex] };
          const sets = [...ex.sets];
          sets[setIndex] = {
            ...sets[setIndex],
            reps,
            weight,
            completed: true,
            rpe,
            kind: sets[setIndex].kind ?? 'normal',
            isPr: isPr || undefined,
          };
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          return {
            activeWorkout: { ...s.activeWorkout, exercises },
          };
        });

        if (isFirstEverSet) {
          const startedAt = readRaw(STORAGE_KEYS.journeyStarted);
          const started = startedAt ? new Date(startedAt).getTime() : NaN;
          track(
            'first_set_logged',
            Number.isFinite(started)
              ? { secondsFromStart: Math.max(0, Math.round((Date.now() - started) / 1000)) }
              : undefined
          );
        }
      },

      logSetAndAdvance: (exerciseIndex, setIndex, reps, weight, isPr) => {
        get().logSet(exerciseIndex, setIndex, reps, weight, 'med', isPr);
        const aw = get().activeWorkout;
        if (!aw) return null;
        return advanceAfterLog(aw.exercises, exerciseIndex, setIndex);
      },

      rateSet: (exerciseIndex, setIndex, rpe) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = { ...exercises[exerciseIndex] };
          const sets = [...ex.sets];
          if (sets[setIndex]) {
            sets[setIndex] = { ...sets[setIndex], rpe };
          }
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          return {
            activeWorkout: { ...s.activeWorkout, exercises },
          };
        });
      },

      setSetKind: (exerciseIndex, setIndex, kind) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = { ...exercises[exerciseIndex] };
          const sets = [...ex.sets];
          if (sets[setIndex] && !sets[setIndex].completed) {
            sets[setIndex] = { ...sets[setIndex], kind };
          }
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          return {
            activeWorkout: { ...s.activeWorkout, exercises },
          };
        });
      },

      unlinkSuperset: (exerciseIndex) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = s.activeWorkout.exercises.map((ex, i) => {
            if (i !== exerciseIndex) return ex;
            const { supersetGroup: _, ...rest } = ex;
            return rest;
          });
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      toggleSupersetWithNext: (exerciseIndex) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const nextIdx = exerciseIndex + 1;
          if (nextIdx >= s.activeWorkout.exercises.length) return s;
          const exercises = [...s.activeWorkout.exercises];
          const current = exercises[exerciseIndex];
          const next = exercises[nextIdx];
          const shared = current.supersetGroup ?? next.supersetGroup ?? `ss-${Date.now()}`;
          exercises[exerciseIndex] = { ...current, supersetGroup: shared };
          exercises[nextIdx] = { ...next, supersetGroup: shared };
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      addSetToExercise: (exerciseIndex) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = exercises[exerciseIndex];
          const lastSet = ex.sets[ex.sets.length - 1];
          exercises[exerciseIndex] = {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: `set-${Date.now()}`,
                reps: lastSet?.reps ?? 10,
                weight: lastSet?.weight ?? 0,
                completed: false,
                kind: lastSet?.kind ?? 'normal',
              },
            ],
          };
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      removeLastPlannedSet: (exerciseIndex) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = exercises[exerciseIndex];
          if (!ex) return s;
          const lastPlannedIdx = [...ex.sets].map((x) => x.completed).lastIndexOf(false);
          if (lastPlannedIdx < 0) return s;
          exercises[exerciseIndex] = {
            ...ex,
            sets: ex.sets.filter((_, i) => i !== lastPlannedIdx),
          };
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      removeExerciseFromActive: (exerciseIndex) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          return {
            activeWorkout: {
              ...s.activeWorkout,
              exercises: s.activeWorkout.exercises.filter((_, i) => i !== exerciseIndex),
            },
          };
        });
      },

      replaceExerciseInActive: (exerciseIndex, newExerciseId, muscleGroups) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = exercises[exerciseIndex];
          if (!ex || ex.sets.some((x) => x.completed)) return s;
          exercises[exerciseIndex] = {
            ...ex,
            exerciseId: newExerciseId,
            // Keep the planned set count; reset target loads — different lift, different weights.
            sets: createLoggedSets(ex.sets.length),
            muscleGroups: muscleGroups?.length ? [...muscleGroups] : undefined,
          };
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      setExerciseNote: (exerciseIndex, note) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = exercises[exerciseIndex];
          if (!ex) return s;
          exercises[exerciseIndex] = { ...ex, note };
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      setSessionNote: (note) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          return { activeWorkout: { ...s.activeWorkout, sessionNote: note } };
        });
      },

      startRestTimer: (seconds = DEFAULT_REST_SECONDS) => {
        set({
          restSecondsRemaining: seconds,
          restTimerInitialSeconds: seconds,
          restTimerActive: true,
        });
      },

      adjustRestTimer: (delta) => {
        set((s) => {
          const next = Math.max(0, s.restSecondsRemaining + delta);
          return {
            restSecondsRemaining: next,
            restTimerActive: next > 0,
            restTimerInitialSeconds:
              next > s.restTimerInitialSeconds ? next : s.restTimerInitialSeconds,
          };
        });
      },

      tickRestTimer: () => {
        set((s) => {
          if (!s.restTimerActive) return s;
          const next = s.restSecondsRemaining - 1;
          if (next <= 0) {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([120, 60, 120]);
            }
            return { restSecondsRemaining: 0, restTimerActive: false };
          }
          return { restSecondsRemaining: next };
        });
      },

      stopRestTimer: () => {
        set({ restSecondsRemaining: 0, restTimerActive: false });
      },

      tickElapsed: () => {
        set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 }));
      },

      getRecentHistory: (limit = 5) => {
        return get().workoutHistory.slice(0, limit);
      },

      loadFromCloud: async () => {
        const user = await getUser();
        if (!user) return;

        // Two reads, because they see different things. The completed_at read is the
        // backfill: it finds history this device has never seen. The updated_at cursor
        // is the only way an *edit* or a tombstone arrives — a completed_at ordering
        // cannot surface a row whose session date is old but whose contents changed,
        // which is why edits and deletes never used to propagate between devices.
        const since = readRaw(STORAGE_KEYS.cloudPullCursor);
        const [recent, changed] = await Promise.all([
          getUserWorkoutHistory(100),
          since ? getUserWorkoutsUpdatedSince(since) : Promise.resolve([]),
        ]);

        const cloudLogs = [...recent, ...changed];
        const mapped = mapCloudToLocal(cloudLogs);

        const { logs, truncated } = mergeWorkoutHistoriesDetailed(get().workoutHistory, mapped);
        set({ workoutHistory: logs });

        // Advance the cursor to the newest updated_at actually seen, so the next pull
        // is cheap. Only after the merge succeeded — a thrown merge must not skip rows.
        const newest = cloudLogs.reduce<string | null>((max, row) => {
          const u = row.updated_at;
          return u && (!max || u > max) ? u : max;
        }, null);
        if (newest) writeRaw(STORAGE_KEYS.cloudPullCursor, newest);

        // HISTORY_CAP dropping sessions used to be invisible. Say so once per load.
        if (truncated > 0) {
          track('history_truncated', { dropped: truncated });
        }
      },

      syncCurrentHistoryToCloud: async () => {
        const user = await getUser();
        if (!user) return;
        // Queue every locally-owned log, not "the last 5 that look local" — that
        // heuristic re-inserted rows (duplicates) and silently abandoned anything
        // older. The outbox de-duplicates by clientId, so re-queueing is free.
        for (const log of get().workoutHistory) {
          if (log.id.startsWith('cloud-')) continue;
          enqueueWorkoutUpsert(log);
        }
        await flushOutbox();
      },
    }),
    {
      name: "workout-tracker-storage",
      // v1: backfill sync-v2 identity so pre-existing logs can reach the cloud
      // without duplicating (they had no stable id the server could key on).
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as { workoutHistory?: CompletedWorkoutLog[] } | undefined;
        if (!state) return persisted as never;
        if (version >= 1) return state as never;
        return {
          ...state,
          workoutHistory: (state.workoutHistory ?? []).map((log) =>
            log.clientId
              ? log
              : {
                  ...log,
                  clientId: newClientId(),
                  revision: log.revision ?? 1,
                  updatedAt: log.updatedAt ?? log.completedAt,
                }
          ),
        } as never;
      },
      partialize: (state) => ({
        savedWorkouts: state.savedWorkouts,
        workoutHistory: state.workoutHistory,
        activeWorkout: state.activeWorkout,
        elapsedSeconds: state.elapsedSeconds,
      }),
      onRehydrateStorage: () => (state, error) => {
        syncActiveFlag(state?.activeWorkout ?? null);
        // NOTE: with a synchronous storage (i.e. every browser) zustand runs this
        // callback *inside* create(), before `useWorkoutStore` is assigned. Touching
        // the store here throws a TDZ ReferenceError that the persist thenable
        // swallows — which is exactly how `hasHydrated` used to stay false forever
        // and leave "Start Workout" permanently disabled on /active. Record the
        // fact and let the reconciliation below own the flag.
        rehydrateSettled = true;
        if (error) {
          console.warn('[workoutStore] rehydrate error', error);
        }
      },
    }
  )
);

function markHydrated(): void {
  if (useWorkoutStore.getState().hasHydrated) return;
  useWorkoutStore.setState({ hasHydrated: true });
}

/**
 * Own `hasHydrated` here, after the store exists.
 *
 * `Start` stays disabled until this flips, so every path has to end in `true`:
 * sync storage (already done), async storage (wait for the listener), and no usable
 * storage at all (nothing to restore — do not block the logger).
 */
const persistApi = useWorkoutStore.persist;
if (!persistApi) {
  // Storage unavailable (SSR, or a browser refusing it). There is nothing to wait for.
  markHydrated();
} else if (rehydrateSettled || persistApi.hasHydrated()) {
  markHydrated();
} else {
  persistApi.onFinishHydration(markHydrated);
}

if (typeof window !== 'undefined') {
  // Last resort: a disabled logger is the worst failure this app has, so never
  // let an unexpected storage error strand it.
  setTimeout(markHydrated, 1_500);
}
