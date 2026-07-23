import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COACH_VICTORY_EARLY_WORKOUTS,
  pickVictoryNextAction,
  summarizeWorkoutVictory,
} from './workoutVictory.ts';
import type { CompletedWorkoutLog } from '@/types';

describe('pickVictoryNextAction', () => {
  it('prefers Mission Coach for early completed workouts', () => {
    const a = pickVictoryNextAction({
      completedWorkouts: 1,
      hasCoachPlan: true,
      proteinLoggedToday: false,
    });
    assert.equal(a.href, '/coach');
    assert.equal(a.labelKey, 'victoryNextCoachLabel');
  });

  it(`prefers Coach through workout #${COACH_VICTORY_EARLY_WORKOUTS}`, () => {
    const a = pickVictoryNextAction({
      completedWorkouts: COACH_VICTORY_EARLY_WORKOUTS,
      hasCoachPlan: true,
    });
    assert.equal(a.href, '/coach');
  });

  it('prefers Coach when no plan even after early window', () => {
    const a = pickVictoryNextAction({
      completedWorkouts: 10,
      hasCoachPlan: false,
      proteinLoggedToday: true,
      strainDelta: 0,
    });
    assert.equal(a.href, '/coach');
  });

  it('prefers Coach when plan exists (wedge stays in Train+Coach)', () => {
    const a = pickVictoryNextAction({
      proteinLoggedToday: false,
      completedWorkouts: 10,
      hasCoachPlan: true,
    });
    assert.equal(a.href, '/coach');
  });

  it('sends high strain to Today rest — not Mind tourism', () => {
    const a = pickVictoryNextAction({
      proteinLoggedToday: true,
      strainDelta: 8,
      completedWorkouts: 10,
      // omit hasCoachPlan so we exercise the rest branch
    });
    assert.equal(a.href, '/log');
  });

  it('falls back to train when no plan and low strain outside early window', () => {
    const a = pickVictoryNextAction({
      proteinLoggedToday: true,
      strainDelta: 0,
      completedWorkouts: 10,
      hasCoachPlan: undefined,
    });
    assert.equal(a.href, '/active');
  });
});

describe('summarizeWorkoutVictory', () => {
  it('aggregates set and exercise counts', () => {
    const log: CompletedWorkoutLog = {
      id: '1',
      workoutName: 'Push',
      startedAt: '2026-07-01T10:00:00Z',
      completedAt: '2026-07-01T10:30:00Z',
      durationSeconds: 1800,
      totalVolume: 5000,
      exercises: [
        { exerciseId: 'bench', sets: [{ reps: 5, weight: 100 }, { reps: 5, weight: 100 }] },
        { exerciseId: 'ohp', sets: [{ reps: 8, weight: 50 }] },
      ],
    };
    const s = summarizeWorkoutVictory(log, 3);
    assert.equal(s.setCount, 3);
    assert.equal(s.exerciseCount, 2);
    assert.equal(s.streak, 3);
    assert.equal(s.workoutName, 'Push');
  });

  it('passes pickOpts through to next action', () => {
    const log: CompletedWorkoutLog = {
      id: '1',
      workoutName: 'Push',
      startedAt: '2026-07-01T10:00:00Z',
      completedAt: '2026-07-01T10:30:00Z',
      durationSeconds: 1800,
      totalVolume: 5000,
      exercises: [{ exerciseId: 'bench', sets: [{ reps: 5, weight: 100 }] }],
    };
    const s = summarizeWorkoutVictory(log, 1, undefined, undefined, undefined, {
      completedWorkouts: 1,
      hasCoachPlan: true,
    });
    assert.equal(s.nextAction?.href, '/coach');
  });
});
