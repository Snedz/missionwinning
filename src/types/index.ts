export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Legs"
  | "Core"
  | "Full Body"
  | "Cardio";

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  equipment?: string;
  cues?: string; // Bodybuilding Ch9/10 + corrective: technique notes, unilateral for symmetry, origin/insertion, rep range for myofibrillar vs sarcoplasmic hypertrophy, periodization context
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
  rpe?: 'easy' | 'med' | 'hard'; // Per-set feedback for progression intelligence (like Forge Easy/Med/Hard)
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
    sets: { reps: number; weight: number; rpe?: 'easy' | 'med' | 'hard' }[];
  }[];
  totalVolume: number;
}

export type NavPage =
  | "home"
  | "benchmarks"
  | "builder"
  | "history"
  | "active";
