import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pickVictoryNextAction, summarizeWorkoutVictory } from './workoutVictory.ts';
import type { CompletedWorkoutLog } from '@/types';

describe('pickVictoryNextAction', () => {
  it('defaults to fuel when protein not logged', () => {
    const a = pickVictoryNextAction({ proteinLoggedToday: false });
    assert.equal(a.href, '/nutrition');
  });

  it('prefers mind when strain is high and protein done', () => {
    const a = pickVictoryNextAction({ proteinLoggedToday: true, strainDelta: 8 });
    assert.equal(a.href, '/mind');
  });

  it('falls back to move when fueled and low strain', () => {
    const a = pickVictoryNextAction({ proteinLoggedToday: true, strainDelta: 0 });
    assert.equal(a.href, '/move');
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
});
