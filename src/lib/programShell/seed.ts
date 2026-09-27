/**
 * One offline template. Authored here — not imported from another product.
 */

import { parseProgram } from './parse';
import type { Program, ProgramExercise, SuggestedSet } from './types';

function sets(count: number, reps: number, weightKg = 0): SuggestedSet[] {
  return Array.from({ length: count }, (_, i) => ({
    setIndex: i + 1,
    reps,
    weightKg,
  }));
}

function lift(order: number, exerciseId: string, count: number, reps: number): ProgramExercise {
  return { order, exerciseId, suggestedSets: sets(count, reps) };
}

const SEED_RAW = {
  id: 'shell-full-body',
  slug: 'full-body-two-week',
  title: 'Full body, two weeks',
  description:
    'Two weeks, two sessions each. Squat, push, pull, and a short hold. Suggested sets are a template — Train is where they become a log.',
  level: 'beginner',
  durationWeeks: 2,
  sessionsPerWeek: 2,
  equipment: ['barbell', 'bodyweight'],
  weeks: [
    {
      weekNumber: 1,
      title: 'Week 1',
      sessions: [
        {
          id: 'shell-fb-w1-a',
          sessionNumber: 1,
          title: 'Day A',
          estimatedMinutes: 40,
          exercises: [
            lift(1, 'squats', 3, 8),
            lift(2, 'bench-press', 3, 8),
            lift(3, 'plank', 3, 30),
          ],
        },
        {
          id: 'shell-fb-w1-b',
          sessionNumber: 2,
          title: 'Day B',
          estimatedMinutes: 40,
          exercises: [lift(1, 'deadlift', 3, 5), lift(2, 'barbell-row', 3, 8)],
        },
      ],
    },
    {
      weekNumber: 2,
      title: 'Week 2',
      sessions: [
        {
          id: 'shell-fb-w2-a',
          sessionNumber: 1,
          title: 'Day A',
          estimatedMinutes: 40,
          exercises: [lift(1, 'squats', 3, 8), lift(2, 'overhead-press', 3, 8)],
        },
        {
          id: 'shell-fb-w2-b',
          sessionNumber: 2,
          title: 'Day B',
          estimatedMinutes: 35,
          exercises: [lift(1, 'deadlift', 1, 5), lift(2, 'bench-press', 3, 8), lift(3, 'plank', 3, 30)],
        },
      ],
    },
  ],
};

function mustProgram(value: unknown): Program {
  const program = parseProgram(value);
  if (!program) throw new Error('program shell seed is not a program');
  return program;
}

export const SEED_PROGRAM: Program = mustProgram(SEED_RAW);
export const SEED_PROGRAM_ID = SEED_PROGRAM.id;
