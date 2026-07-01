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

export type SetKind = 'normal' | 'warmup' | 'failure';

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
}

export interface LoggedSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  kind?: SetKind;
  rpe?: 'easy' | 'med' | 'hard';
}

export interface ActiveExerciseLog {
  exerciseId: string;
  sets: LoggedSet[];
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
  }[];
  totalVolume: number;
}

export type NavPage =
  | "home"
  | "benchmarks"
  | "builder"
  | "history"
  | "active";
