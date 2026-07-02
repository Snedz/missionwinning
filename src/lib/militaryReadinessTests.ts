
export interface MilitaryReadinessTest {
  id: string;
  name: string;
  exerciseId: string;
  description: string;
  scoringHint: string;
  unit: string;
}

/** Optional readiness standards — for members preparing for service fitness tests. */
export const MILITARY_READINESS_TESTS: MilitaryReadinessTest[] = [
  {
    id: 'push-ups',
    name: 'Push-ups',
    exerciseId: 'push-ups',
    description: 'Max reps in 2 minutes with strict form (front-leaning rest).',
    scoringHint: 'Log your best set in Train; track progress here over time.',
    unit: 'reps',
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    exerciseId: 'pull-ups',
    description: 'Strict dead-hang pull-ups — chin over bar, full extension at bottom.',
    scoringHint: 'Use assisted variations in training; test with strict form when ready.',
    unit: 'reps',
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    exerciseId: 'deadlift',
    description: '3-rep or 1-rep max with safe form — common strength standard.',
    scoringHint: 'Log working sets in Train; estimated 1RM appears in benchmarks.',
    unit: 'lbs / kg',
  },
  {
    id: 'sled-push',
    name: 'Sled push / drag',
    exerciseId: 'lunges',
    description: 'Loaded carry or sled event — train with lunges, pushes, and loaded walks.',
    scoringHint: 'Log timed carries in Track; build leg drive with squat and lunge patterns.',
    unit: 'time / distance',
  },
];
