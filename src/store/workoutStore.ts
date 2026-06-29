import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EXERCISES } from "@/data/exercises";
import { calculateVolume } from "@/lib/utils";
import type {
  ActiveWorkout,
  CompletedWorkoutLog,
  LoggedSet,
  SavedWorkout,
  WorkoutExerciseTemplate,
} from "@/types";
import { saveWorkoutLog, getUserWorkoutHistory, getUser } from "@/lib/supabase";
import { recordWorkoutCompleted } from "@/lib/challenges";
import { mapCloudToLocal, mergeWorkoutHistories } from "@/lib/workoutMerge";

const DEFAULT_REST_SECONDS = 30;

interface WorkoutState {
  savedWorkouts: SavedWorkout[];
  workoutHistory: CompletedWorkoutLog[];
  activeWorkout: ActiveWorkout | null;
  restSecondsRemaining: number;
  restTimerActive: boolean;
  elapsedSeconds: number;

  addSavedWorkout: (workout: Omit<SavedWorkout, "id" | "createdAt">) => void;
  deleteSavedWorkout: (id: string) => void;
  startWorkout: (name: string, exercises: WorkoutExerciseTemplate[], workoutId?: string) => void;
  startEmptyWorkout: () => void;
  cancelActiveWorkout: () => void;
  completeActiveWorkout: () => CompletedWorkoutLog | null;
  addExerciseToActive: (exerciseId: string) => void;
  logSet: (exerciseIndex: number, setIndex: number, reps: number, weight: number, rpe?: 'easy' | 'med' | 'hard') => void;
  rateSet: (exerciseIndex: number, setIndex: number, rpe: 'easy' | 'med' | 'hard') => void;
  addSetToExercise: (exerciseIndex: number) => void;
  startRestTimer: (seconds?: number) => void;
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
        });
      },

      cancelActiveWorkout: () => {
        set({
          activeWorkout: null,
          elapsedSeconds: 0,
          restSecondsRemaining: 0,
          restTimerActive: false,
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
              .map((s) => ({ reps: s.reps, weight: s.weight, rpe: s.rpe })),
          }))
          .filter((ex) => ex.sets.length > 0);

        if (exercises.length === 0) {
          set({ activeWorkout: null, elapsedSeconds: 0 });
          return null;
        }

        const allSets = exercises.flatMap((e) => e.sets);
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
        }));

        recordWorkoutCompleted(log);

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

      logSet: (exerciseIndex, setIndex, reps, weight, rpe?: 'easy' | 'med' | 'hard') => {
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
          };
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          return {
            activeWorkout: { ...s.activeWorkout, exercises },
          };
        });
        get().startRestTimer(DEFAULT_REST_SECONDS);
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
              },
            ],
          };
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      startRestTimer: (seconds = DEFAULT_REST_SECONDS) => {
        set({ restSecondsRemaining: seconds, restTimerActive: true });
      },

      tickRestTimer: () => {
        set((s) => {
          if (!s.restTimerActive) return s;
          const next = s.restSecondsRemaining - 1;
          if (next <= 0) {
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
