import type { WorkoutExerciseTemplate } from '@/types';
import { DEFAULT_EQUIPMENT } from '@/lib/equipmentPrefs';

export interface TodaysWorkout {
  name: string;
  tag: 'WOD' | 'Strength' | 'Mobility' | 'Conditioning';
  description: string;
  exercises: WorkoutExerciseTemplate[];
  /** Minimum equipment tier for this rotation entry. */
  equipmentTier: 'bodyweight' | 'dumbbells' | 'full-gym';
}

/** Rotating daily workouts — CrossFit / Freeletics inspired, all free core. */
const ROTATION: TodaysWorkout[] = [
  {
    name: "Today's WOD — Full Body AMRAP",
    tag: 'WOD',
    description: '20 min AMRAP: push, squat, core. Scale reps to your level.',
    equipmentTier: 'bodyweight',
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
    equipmentTier: 'full-gym',
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
    equipmentTier: 'bodyweight',
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
    equipmentTier: 'dumbbells',
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
    equipmentTier: 'bodyweight',
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
    equipmentTier: 'dumbbells',
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
    equipmentTier: 'full-gym',
    exercises: [
      { exerciseId: 'squats', sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
      { exerciseId: 'romanian-deadlift', sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: 'step-ups', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'dead-bug', sets: [{ reps: 10, weight: 0 }] },
    ],
  },
];

const TIER_RANK: Record<TodaysWorkout['equipmentTier'], number> = {
  bodyweight: 0,
  dumbbells: 1,
  'full-gym': 2,
};

function userTierRank(equipment: string): number {
  if (equipment === 'bodyweight') return 0;
  if (equipment === 'dumbbells') return 1;
  return 2;
}

export function filterWorkoutsForEquipment(
  equipment: string,
  lowImpactOnly = false
): TodaysWorkout[] {
  const maxRank = userTierRank(equipment || DEFAULT_EQUIPMENT);
  let pool = ROTATION.filter((w) => TIER_RANK[w.equipmentTier] <= maxRank);
  if (lowImpactOnly) {
    pool = pool.filter((w) => w.tag === 'Mobility' || w.equipmentTier === 'bodyweight');
  }
  return pool.length ? pool : ROTATION.filter((w) => w.equipmentTier === 'bodyweight');
}

export function getTodaysWorkout(
  date = new Date(),
  opts?: { equipment?: string; lowImpactOnly?: boolean }
): TodaysWorkout {
  const equipment = opts?.equipment ?? DEFAULT_EQUIPMENT;
  const pool = filterWorkoutsForEquipment(equipment, opts?.lowImpactOnly);
  const dayIndex = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / (1000 * 3600 * 24)) %
      pool.length
  );
  return pool[dayIndex];
}
