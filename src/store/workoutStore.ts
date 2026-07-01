import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EXERCISES } from "@/data/exercises";
import { calculateVolume } from "@/lib/utils";
import type {
  ActiveWorkout,
  CompletedWorkoutLog,
  LoggedSet,
  SavedWorkout,
  SetKind,
  WorkoutExerciseTemplate,
} from "@/types";
import { countsTowardVolume } from "@/lib/setKind";
import { advanceAfterLog } from "@/lib/superset";
import { saveWorkoutLog, getUserWorkoutHistory, getUser } from "@/lib/supabase";
import { recordWorkoutCompleted } from "@/lib/challenges";
import { scheduleLeaderboardPush } from "@/lib/leaderboardSync";
import { mapCloudToLocal, mergeWorkoutHistories } from "@/lib/workoutMerge";

const DEFAULT_REST_SECONDS = 30;

interface WorkoutState {
  savedWorkouts: SavedWorkout[];
  workoutHistory: CompletedWorkoutLog[];
  activeWorkout: ActiveWorkout | null;
  restSecondsRemaining: number;
  restTimerActive: boolean;
  restTimerInitialSeconds: number;
  elapsedSeconds: number;

  addSavedWorkout: (workout: Omit<SavedWorkout, "id" | "createdAt">) => void;
  deleteSavedWorkout: (id: string) => void;
  startWorkout: (name: string, exercises: WorkoutExerciseTemplate[], workoutId?: string) => void;
  startEmptyWorkout: () => void;
  cancelActiveWorkout: () => void;
  completeActiveWorkout: () => CompletedWorkoutLog | null;
  addExerciseToActive: (exerciseId: string) => void;
  logSet: (
    exerciseIndex: number,
    setIndex: number,
    reps: number,
    weight: number,
    rpe?: 'easy' | 'med' | 'hard'
  ) => void;
  logSetAndAdvance: (
    exerciseIndex: number,
    setIndex: number,
    reps: number,
    weight: number
  ) => { exerciseIndex: number; setIndex: number } | null;
  rateSet: (exerciseIndex: number, setIndex: number, rpe: 'easy' | 'med' | 'hard') => void;
  setSetKind: (exerciseIndex: number, setIndex: number, kind: SetKind) => void;
  toggleSupersetWithNext: (exerciseIndex: number) => void;
  unlinkSuperset: (exerciseIndex: number) => void;
  addSetToExercise: (exerciseIndex: number) => void;
  startRestTimer: (seconds?: number) => void;
  adjustRestTimer: (delta: number) => void;
  tickRestTimer: () => void;
  stopRestTimer: () => void;
  tickElapsed: () => void;
  getRecentHistory: (limit?: number) => CompletedWorkoutLog[];
  loadFromCloud: () => Promise<void>;
  syncCurrentHistoryToCloud: () => Promise<void>;
}

function createLoggedSets(count: number, reps = 10, weight = 0): LoggedSet[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `set-${Date.now()}-${i}`,
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
        const active: ActiveWorkout = {
          workoutId,
          workoutName: name,
          startedAt: new Date().toISOString(),
          exercises: exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: createLoggedSets(ex.sets.length, ex.sets[0]?.reps ?? 10, ex.sets[0]?.weight ?? 0),
          })),
        };
        set({
          activeWorkout: active,
          elapsedSeconds: 0,
          restSecondsRemaining: 0,
          restTimerActive: false,
          restTimerInitialSeconds: 90,
        });
      },

      startEmptyWorkout: () => {
        set({
          activeWorkout: {
            workoutName: "Quick Workout",
            startedAt: new Date().toISOString(),
            exercises: [],
          },
          elapsedSeconds: 0,
          restSecondsRemaining: 0,
          restTimerActive: false,
          restTimerInitialSeconds: 90,
        });
      },

      cancelActiveWorkout: () => {
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

        const exercises = activeWorkout.exercises
          .map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets
              .filter((s) => s.completed)
              .map((s) => ({
                reps: s.reps,
                weight: s.weight,
                kind: s.kind ?? 'normal',
                rpe: s.rpe,
              })),
          }))
          .filter((ex) => ex.sets.length > 0);

        if (exercises.length === 0) {
          set({ activeWorkout: null, elapsedSeconds: 0 });
          return null;
        }

        const allSets = exercises.flatMap((e) => e.sets).filter((s) => countsTowardVolume(s.kind));
        const log: CompletedWorkoutLog = {
          id: `log-${Date.now()}`,
          workoutName: activeWorkout.workoutName,
          startedAt: activeWorkout.startedAt,
          completedAt: new Date().toISOString(),
          durationSeconds: elapsedSeconds,
          exercises,
          totalVolume: calculateVolume(allSets),
        };

        set((s) => ({
          workoutHistory: [log, ...s.workoutHistory],
          activeWorkout: null,
          elapsedSeconds: 0,
          restSecondsRemaining: 0,
          restTimerActive: false,
          restTimerInitialSeconds: 90,
        }));

        recordWorkoutCompleted(log);

        const savedCount = get().savedWorkouts.length;
        scheduleLeaderboardPush(get().workoutHistory, savedCount);

        // Auto sync to cloud if signed in (non-blocking)
        getUser().then(u => {
          if (u) saveWorkoutLog({
            workout_name: log.workoutName,
            started_at: log.startedAt,
            completed_at: log.completedAt,
            duration_seconds: log.durationSeconds,
            exercises: log.exercises,
            total_volume: log.totalVolume,
          }).catch(()=>{}); 
        });

        return log;
      },

      addExerciseToActive: (exerciseId) => {
        const exercise = EXERCISES.find((e) => e.id === exerciseId);
        if (!exercise) return;

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
                },
              ],
            },
          };
        });
      },

      logSet: (exerciseIndex, setIndex, reps, weight, rpe) => {
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
          };
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          return {
            activeWorkout: { ...s.activeWorkout, exercises },
          };
        });
      },

      logSetAndAdvance: (exerciseIndex, setIndex, reps, weight) => {
        get().logSet(exerciseIndex, setIndex, reps, weight);
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
        const cloudLogs = await getUserWorkoutHistory(100);
        const mapped = mapCloudToLocal(cloudLogs);
        set((s) => ({
          workoutHistory: mergeWorkoutHistories(s.workoutHistory, mapped),
        }));
      },

      syncCurrentHistoryToCloud: async () => {
        const user = await getUser();
        if (!user) return;
        const { workoutHistory } = get();
        // Save recent ones not yet in cloud (simple: save last 5 that look local)
        const toSync = workoutHistory.slice(0, 5).filter(l => !l.id.startsWith('cloud-'));
        for (const log of toSync) {
          await saveWorkoutLog({
            workout_name: log.workoutName,
            started_at: log.startedAt,
            completed_at: log.completedAt,
            duration_seconds: log.durationSeconds,
            exercises: log.exercises,
            total_volume: log.totalVolume,
          });
        }
      },
    }),
    {
      name: "workout-tracker-storage",
      partialize: (state) => ({
        savedWorkouts: state.savedWorkouts,
        workoutHistory: state.workoutHistory,
        activeWorkout: state.activeWorkout,
        elapsedSeconds: state.elapsedSeconds,
      }),
    }
  )
);
