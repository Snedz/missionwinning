/**
 * Local program template. Not a logged workout.
 * Shape: Program → Week → Session → exercise → suggested set.
 */

export const PROGRAM_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type ProgramLevel = (typeof PROGRAM_LEVELS)[number];

export const PROGRAM_EQUIPMENT = [
  'barbell',
  'dumbbell',
  'bodyweight',
  'band',
  'bench',
  'pullup-bar',
] as const;
export type ProgramEquipment = (typeof PROGRAM_EQUIPMENT)[number];

/** A suggested set on a template. Not a logged set. */
export interface SuggestedSet {
  setIndex: number;
  reps?: number;
  /** Kilograms. The logger converts at start. Omit when the set is a hold only. */
  weightKg?: number;
  seconds?: number;
}

export interface ProgramExercise {
  order: number;
  /** Id in the MW exercise catalog. */
  exerciseId: string;
  note?: string;
  suggestedSets: SuggestedSet[];
}

export interface ProgramSession {
  id: string;
  sessionNumber: number;
  title: string;
  estimatedMinutes?: number;
  exercises: ProgramExercise[];
}

export interface ProgramWeek {
  weekNumber: number;
  title: string;
  sessions: ProgramSession[];
}

export interface Program {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: ProgramLevel;
  durationWeeks: number;
  sessionsPerWeek: number;
  equipment: ProgramEquipment[];
  weeks: ProgramWeek[];
}
