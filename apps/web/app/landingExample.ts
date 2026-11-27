import type { CompletedWorkoutLog } from '@/types';

export const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const sampleDay = (offset: number) => new Date(2026, 5, 8 + offset, 12);
export const exampleSets = [
  { id: 'one', reps: 10, weight: 20, completed: true },
  { id: 'two', reps: 10, weight: 20, completed: true },
  { id: 'three', reps: 10, weight: 20, completed: true },
];

const exampleDate = sampleDay(0).toISOString();
const exampleWorkout: CompletedWorkoutLog = {
  id: 'landing-example',
  workoutName: 'Lower body',
  completedAt: exampleDate,
  startedAt: exampleDate,
  durationSeconds: 600,
  weightUnit: 'kg',
  totalVolume: exampleSets.reduce((volume, set) => volume + set.reps * set.weight, 0),
  exercises: [{ exerciseId: 'lunges', sets: exampleSets }],
};

export const exampleHistory = [exampleWorkout];
