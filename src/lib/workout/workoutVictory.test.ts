import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COACH_VICTORY_EARLY_WORKOUTS,
  buildProgressionInsight,
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

describe('buildProgressionInsight', () => {
  const freestyleLog: CompletedWorkoutLog = {
    id: '1',
    workoutName: 'Just Go',
    startedAt: '2026-07-01T10:00:00Z',
    completedAt: '2026-07-01T10:30:00Z',
    durationSeconds: 1800,
    totalVolume: 5000,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [
          { reps: 12, weight: 100 },
          { reps: 12, weight: 100 },
        ],
      },
    ],
  };

  it('uses freestyle double progression when nothing was prescribed', () => {
    const line = buildProgressionInsight(freestyleLog, 'metric', { min: 8, max: 12 });
    assert.ok(line);
    assert.match(line!, /Next:/);
    assert.doesNotMatch(line!, /Mission Coach|not freestyle/i);
  });

  it('does not freestyle-progress a Mission Coach prescribed session', () => {
    const log: CompletedWorkoutLog = {
      ...freestyleLog,
      workoutName: 'Push A',
      exercises: [
        {
          exerciseId: 'bench-press',
          prescribed: true,
          // Strength 3×5 — freestyle 8–12 engine would wrongly say "add reps"
          sets: [
            { reps: 5, weight: 100 },
            { reps: 5, weight: 100 },
            { reps: 5, weight: 100 },
          ],
        },
      ],
    };
    const line = buildProgressionInsight(log, 'metric', { min: 8, max: 12 });
    assert.ok(line);
    assert.match(line!, /Mission Coach/i);
    assert.match(line!, /not freestyle/i);
    assert.doesNotMatch(line!, /hit top of range|Next: \+/);
  });

  it('treats a mixed session with any prescribed lift as coached', () => {
    const log: CompletedWorkoutLog = {
      ...freestyleLog,
      exercises: [
        { exerciseId: 'bench-press', prescribed: true, sets: [{ reps: 5, weight: 100 }] },
        { exerciseId: 'lateral-raise', sets: [{ reps: 12, weight: 10 }] },
      ],
    };
    const line = buildProgressionInsight(log, 'metric');
    assert.ok(line);
    assert.match(line!, /Mission Coach/i);
  });
});
