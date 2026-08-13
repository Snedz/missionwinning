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

/** Optional laterality on a unilateral set — not a SetKind, not a superset pair. */
export type SetSide = 'L' | 'R' | 'alt';

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
  /**
   * Percent of working max for THIS set — how 5/3/1-style waves are authored
   * (65/75/85 inside one session), which the exercise-level `loadPct` cannot
   * express. Materialized into `weight` against the athlete's own history at
   * `startWorkout` time by `lib/workout/materializeProgram.ts`; with no history
   * the authored weight (usually 0) stands and the logger behaves as today.
   */
  loadPct?: number;
}

export interface WorkoutExerciseTemplate {
  exerciseId: string;
  sets: WorkoutSetTemplate[];
  /** Percent of working max when started from Coach % prescription. */
  loadPct?: number;
  /**
   * True when these reps/weights came from the Coach plan rather than being a
   * generic starting point. The logger must PREFILL a prescription rather than
   * overwrite it with its own suggestion — see `getSetInput` in ActiveWorkoutPage.
   */
  prescribed?: boolean;
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
  /**
   * Optional reps in reserve, integer 0–5 (`.725`). Never required; never
   * replaces `rpe`. Empty / omitted is valid.
   */
  rir?: number;
  /** Set at log time when this beat prior e1RM — brass chip on row. */
  isPr?: boolean;
  /** L / R / Alt — only meaningful on a unilateral exercise; omit on bilateral. */
  side?: SetSide;
}

export interface ActiveExerciseLog {
  exerciseId: string;
  sets: LoggedSet[];
  /** Shared id — exercises in the same group are supersetted (minimal rest between). */
  supersetGroup?: string;
  /** Free-form note for this exercise ("felt heavy", "machine 3, seat pos 4"). */
  note?: string;
  /** Snapshot from catalog when exercise was added — avoids store importing EXERCISES. */
  muscleGroups?: MuscleGroup[];
  /** Percent of working max when session started from Coach % prescription. */
  loadPct?: number;
  /** These sets were prescribed by the Coach plan; the logger must not override them. */
  prescribed?: boolean;
}

export interface ActiveWorkout {
  workoutId?: string;
  workoutName: string;
  startedAt: string;
  exercises: ActiveExerciseLog[];
  /**
   * Session-level field note, jotted in the rest window ("knee twinge set 3").
   * Journal content in the Day One sense: at finish it becomes fragments in the
   * device-only journal — it is deliberately NOT copied onto CompletedWorkoutLog,
   * which syncs to the cloud. Exercise notes sync; the journal never leaves.
   */
  sessionNote?: string;
}

export interface CompletedWorkoutLog {
  id: string;
  /**
   * Stable client-minted UUID — the identity used for cloud sync (sync v2).
   * Optional only for logs written before the migration in `workoutStore`;
   * new logs always have one. See `src/lib/sync/workoutSync.ts`.
   */
  clientId?: string;
  /** Monotonic per-log revision; highest wins on merge. */
  revision?: number;
  updatedAt?: string;
  /** Tombstone — set instead of removing so a delete propagates between devices. */
  deletedAt?: string | null;
  workoutName: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  exercises: {
    exerciseId: string;
    sets: {
      reps: number;
      weight: number;
      kind?: SetKind;
      rpe?: 'easy' | 'med' | 'hard';
      side?: SetSide;
      /** Optional 0–5; omitted when the athlete did not rate RIR (`.756`). */
      rir?: number;
    }[];
    note?: string;
    /** Snapshot from catalog at complete time — readiness can skip EXERCISES lookup. */
    muscleGroups?: MuscleGroup[];
    /**
     * True when this exercise came from Mission Coach (or a % program) rather
     * than freestyle Just Go. Kept on the completed log so Victory can refuse
     * freestyle double-progression copy after a coached session (`.410`).
     */
    prescribed?: boolean;
  }[];
  totalVolume: number;
}

export type NavPage =
  | "home"
  | "benchmarks"
  | "builder"
  | "history"
  | "active";
