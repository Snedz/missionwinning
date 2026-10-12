import type { WorkoutExerciseTemplate } from '@/types';

export type StarterProgram = {
  name: string;
  exercises: WorkoutExerciseTemplate[];
};

/**
 * The free programs `starterForFocus` can actually select.
 *
 * `FREE_STARTER_PROGRAMS` is the Today quick-options wall (~3.5 KB gzip).
 * Just Go only `find()`s a name hint, and the first hit is always one of
 * these six, in this order. Shipping the rest on `/log` and `/active`
 * initial JS is how Next 16.4's runtime growth crossed the bundle caps.
 * The wall stays on `starterPrograms.ts`, which Today loads off the
 * prerender script list. One definition: `FREE_STARTER_PROGRAMS` spreads
 * this array back in, it does not copy the objects.
 */
export const STARTER_FOCUS_FALLBACK: StarterProgram[] = [
  { name: "Free Full Body Starter (5x5)", exercises: [
    { exerciseId: "squats", sets: [{ reps: 5, weight: 0 }] },
    { exerciseId: "bench-press", sets: [{ reps: 5, weight: 0 }] },
    { exerciseId: "barbell-row", sets: [{ reps: 5, weight: 0 }] },
    { exerciseId: "overhead-press", sets: [{ reps: 5, weight: 0 }] },
    { exerciseId: "deadlift", sets: [{ reps: 5, weight: 0 }] },
  ]},
  { name: "Free Bodyweight Circuit", exercises: [
    { exerciseId: "push-ups", sets: [{ reps: 10, weight: 0 }] },
    { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
    { exerciseId: "plank", sets: [{ reps: 30, weight: 0 }] },
    { exerciseId: "lunges", sets: [{ reps: 8, weight: 0 }] },
    { exerciseId: "burpees", sets: [{ reps: 5, weight: 0 }] },
  ]},
  { name: "Free Upper Focus (Bodyweight + DB)", exercises: [
    { exerciseId: "push-ups", sets: [{ reps: 12, weight: 0 }] },
    { exerciseId: "overhead-press", sets: [{ reps: 8, weight: 0 }] },
    { exerciseId: "bicep-curl", sets: [{ reps: 10, weight: 0 }] },
    { exerciseId: "tricep-pushdown", sets: [{ reps: 10, weight: 0 }] },
    { exerciseId: "lat-pulldown", sets: [{ reps: 10, weight: 0 }] },
  ]},
  { name: "Free Lower + Core Starter", exercises: [
    { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
    { exerciseId: "romanian-deadlift", sets: [{ reps: 8, weight: 0 }] },
    { exerciseId: "lunges", sets: [{ reps: 8, weight: 0 }] },
    { exerciseId: "glute-bridge", sets: [{ reps: 12, weight: 0 }] },
    { exerciseId: "plank", sets: [{ reps: 45, weight: 0 }] },
  ]},
  { name: "Free Push/Pull Beginner", exercises: [
    { exerciseId: "push-ups", sets: [{ reps: 10, weight: 0 }] },
    { exerciseId: "overhead-press", sets: [{ reps: 8, weight: 0 }] },
    { exerciseId: "barbell-row", sets: [{ reps: 8, weight: 0 }] },
    { exerciseId: "bicep-curl", sets: [{ reps: 10, weight: 0 }] },
    { exerciseId: "tricep-pushdown", sets: [{ reps: 10, weight: 0 }] },
  ]},
  { name: "Daily Mobility Circuit (Free)", exercises: [
    { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
    { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
    { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
    { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
    { exerciseId: "bear-crawl", sets: [{ reps: 10, weight: 0 }] },
  ]},
];
