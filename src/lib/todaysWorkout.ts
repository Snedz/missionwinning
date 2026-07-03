import type { WorkoutExerciseTemplate } from '@/types';

export interface TodaysWorkout {
  name: string;
  tag: 'WOD' | 'Strength' | 'Mobility' | 'Conditioning';
  description: string;
  exercises: WorkoutExerciseTemplate[];
}

/** Rotating daily workouts — CrossFit / Freeletics inspired, all free core. */
const ROTATION: TodaysWorkout[] = [
  {
    name: "Today's WOD — Full Body AMRAP",
    tag: 'WOD',
    description: '20 min AMRAP: push, squat, core. Scale reps to your level.',
    exercises: [
      { exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'squats', sets: [{ reps: 15, weight: 0 }] },
      { exerciseId: 'burpees', sets: [{ reps: 5, weight: 0 }] },
      { exerciseId: 'mountain-climbers', sets: [{ reps: 20, weight: 0 }] },
    ],
  },
  {
    name: "Today's Strength — 5×5 Essentials",
    tag: 'Strength',
    description: 'Classic linear strength session. Add weight when all sets feel solid.',
    exercises: [
      { exerciseId: 'squats', sets: [{ reps: 5, weight: 0 }, { reps: 5, weight: 0 }, { reps: 5, weight: 0 }] },
      { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 0 }, { reps: 5, weight: 0 }, { reps: 5, weight: 0 }] },
      { exerciseId: 'barbell-row', sets: [{ reps: 5, weight: 0 }, { reps: 5, weight: 0 }, { reps: 5, weight: 0 }] },
    ],
  },
  {
    name: "Today's Mobility — 10 Min Reset",
    tag: 'Mobility',
    description: 'Move pillar starter. Hold each cue with steady breath.',
    exercises: [
      { exerciseId: 'worlds-greatest-stretch', sets: [{ reps: 3, weight: 0 }] },
      { exerciseId: 'cat-camel', sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: 'couch-stretch', sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: 'thread-needle', sets: [{ reps: 6, weight: 0 }] },
    ],
  },
  {
    name: "Today's Conditioning — EMOM 12",
    tag: 'Conditioning',
    description: 'Every minute on the minute for 12 rounds. Rest with time left in each minute.',
    exercises: [
      { exerciseId: 'kettlebell-swing', sets: [{ reps: 15, weight: 0 }] },
      { exerciseId: 'push-ups', sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: 'jump-squats', sets: [{ reps: 10, weight: 0 }] },
    ],
  },
  {
    name: "Today's Bodyweight — No Equipment",
    tag: 'WOD',
    description: 'Train anywhere. Global-friendly session — park, home, hotel.',
    exercises: [
      { exerciseId: 'push-ups', sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: 'inverted-row', sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: 'lunges', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'plank', sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: 'glute-bridge', sets: [{ reps: 12, weight: 0 }] },
    ],
  },
  {
    name: "Today's Upper Push/Pull",
    tag: 'Strength',
    description: 'Upper body balance — push and pull in one session.',
    exercises: [
      { exerciseId: 'overhead-press', sets: [{ reps: 8, weight: 0 }, { reps: 8, weight: 0 }] },
      { exerciseId: 'pull-ups', sets: [{ reps: 6, weight: 0 }, { reps: 6, weight: 0 }] },
      { exerciseId: 'dips-chair', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'face-pull-band', sets: [{ reps: 15, weight: 0 }] },
    ],
  },
  {
    name: "Today's Lower + Core",
    tag: 'Strength',
    description: 'Legs and core for athletic base. Scale load or use bodyweight.',
    exercises: [
      { exerciseId: 'squats', sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
      { exerciseId: 'romanian-deadlift', sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: 'step-ups', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'dead-bug', sets: [{ reps: 10, weight: 0 }] },
    ],
  },
  {
    name: "Today's Core & Carry",
    tag: 'Strength',
    description: 'Anti-rotation and loaded carries — athletic durability.',
    exercises: [
      { exerciseId: 'pallof-press', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'farmer-carry', sets: [{ reps: 40, weight: 0 }] },
      { exerciseId: 'plank', sets: [{ reps: 45, weight: 0 }] },
      { exerciseId: 'dead-bug', sets: [{ reps: 10, weight: 0 }] },
    ],
  },
  {
    name: "Today's Pull Focus",
    tag: 'Strength',
    description: 'Back and biceps density — rows and pulls.',
    exercises: [
      { exerciseId: 'pull-ups', sets: [{ reps: 6, weight: 0 }, { reps: 6, weight: 0 }] },
      { exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 0 }, { reps: 8, weight: 0 }] },
      { exerciseId: 'face-pull-band', sets: [{ reps: 15, weight: 0 }] },
      { exerciseId: 'hammer-curl', sets: [{ reps: 10, weight: 0 }] },
    ],
  },
  {
    name: "Today's Push Circuit",
    tag: 'WOD',
    description: '3 rounds for quality — push strength endurance.',
    exercises: [
      { exerciseId: 'push-ups', sets: [{ reps: 15, weight: 0 }] },
      { exerciseId: 'dips-chair', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'pike-pushup', sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: 'plank', sets: [{ reps: 40, weight: 0 }] },
    ],
  },
  {
    name: "Today's Leg Volume",
    tag: 'Strength',
    description: 'Higher rep leg work — hypertrophy friendly.',
    exercises: [
      { exerciseId: 'goblet-squat', sets: [{ reps: 12, weight: 0 }, { reps: 12, weight: 0 }] },
      { exerciseId: 'romanian-deadlift', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'walking-lunge', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'calf-raise', sets: [{ reps: 15, weight: 0 }] },
    ],
  },
  {
    name: "Today's Band & Body",
    tag: 'Mobility',
    description: 'Minimal equipment session — bands and bodyweight.',
    exercises: [
      { exerciseId: 'band-pull-apart', sets: [{ reps: 20, weight: 0 }] },
      { exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'split-squat', sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: 'glute-bridge', sets: [{ reps: 12, weight: 0 }] },
    ],
  },
  {
    name: "Today's Conditioning Ladder",
    tag: 'Conditioning',
    description: 'Ascending reps — pace yourself.',
    exercises: [
      { exerciseId: 'burpees', sets: [{ reps: 5, weight: 0 }] },
      { exerciseId: 'jump-squat', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'mountain-climbers', sets: [{ reps: 20, weight: 0 }] },
      { exerciseId: 'high-knees', sets: [{ reps: 30, weight: 0 }] },
    ],
  },
  {
    name: "Today's Unilateral Day",
    tag: 'Strength',
    description: 'Single-leg and single-arm balance for symmetry.',
    exercises: [
      { exerciseId: 'bulgarian-split-squat', sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: 'single-leg-rdl', sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: 'dumbbell-row', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'side-plank', sets: [{ reps: 30, weight: 0 }] },
    ],
  },
];

export function getTodaysWorkout(date = new Date()): TodaysWorkout {
  const dayIndex = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / (1000 * 3600 * 24)) %
      ROTATION.length
  );
  return ROTATION[dayIndex];
}
