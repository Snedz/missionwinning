export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Legs"
  | "Core"
  | "Full Body"
  | "Cardio";

export type ProgramTag = "strength" | "hypertrophy" | "conditioning" | "corrective";

export type SetKind = 'normal' | 'warmup' | 'failure' | 'drop';

export type Rpe = 'easy' | 'med' | 'hard';

export type ExerciseLevel = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  equipment?: string;
  cues?: string;
  /** Primary program styles this exercise supports (Phase D). */
  tags?: ProgramTag[];
  /** Substitute exercise ids when equipment or skill differs. */
  alternatives?: string[];
  level?: ExerciseLevel;
}

export interface WorkoutSetTemplate {
  reps: number;
  weight: number;
}

export interface WorkoutExerciseTemplate {
  exerciseId: string;
  sets: WorkoutSetTemplate[];
}

export interface SavedWorkout {
  id: string;
  name: string;
  exercises: WorkoutExerciseTemplate[];
  createdAt: string;
  /** Routine notes from the Builder (programming intent, cues). */
  note?: string;
}

export interface LoggedSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  kind?: SetKind;
  rpe?: Rpe;
}

export interface ActiveExerciseLog {
  exerciseId: string;
  sets: LoggedSet[];
  /** Shared id — exercises in the same group are supersetted (minimal rest between). */
  supersetGroup?: string;
  /** Free-form note for this exercise ("felt heavy", "machine 3, seat pos 4"). */
  note?: string;
}

export interface ActiveWorkout {
  workoutId?: string;
  workoutName: string;
  startedAt: string;
  exercises: ActiveExerciseLog[];
}

export interface CompletedWorkoutLog {
  id: string;
  workoutName: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  exercises: {
    exerciseId: string;
    sets: { reps: number; weight: number; kind?: SetKind; rpe?: 'easy' | 'med' | 'hard' }[];
    note?: string;
  }[];
  totalVolume: number;
}

export type NavPage =
  | "home"
  | "benchmarks"
  | "builder"
  | "history"
  | "active";
