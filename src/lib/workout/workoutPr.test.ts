import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getBestPriorSet, isPersonalRecord } from '@/lib/workout/workoutPr';
import type { CompletedWorkoutLog } from '@/types';

const history: CompletedWorkoutLog[] = [
  {
    id: '1',
    workoutName: 'Test',
    startedAt: '2025-01-01T10:00:00Z',
    completedAt: '2025-01-01T10:00:00Z',
    durationSeconds: 1800,
    totalVolume: 800,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [{ reps: 8, weight: 100 }],
      },
    ],
  },
];

describe('workoutPr', () => {
  it('returns null when no prior sets', () => {
    assert.equal(getBestPriorSet('squat', history), null);
  });

  it('detects PR when beating prior e1RM', () => {
    // Clear of the prior 8 × 100 (estimates 124): 5 × 125 estimates 141.
    assert.equal(isPersonalRecord('bench-press', 5, 125, history), true);
    assert.equal(isPersonalRecord('bench-press', 8, 100, history), false);
  });

  it('an equivalent performance is not a record', () => {
    // 5 × 110 and the prior 8 × 100 both estimate 124 — the same strength expressed
    // two ways. Uncapped Epley separated them by 1 kg and fired a PR chip for it;
    // celebrating that is congratulating the athlete for rounding.
    assert.equal(isPersonalRecord('bench-press', 5, 110, history), false);
  });

  it('warmup sets do not trigger PR', () => {
    assert.equal(isPersonalRecord('bench-press', 10, 120, history, 'warmup'), false);
  });

  it('drop sets do not trigger PR', () => {
    assert.equal(isPersonalRecord('bench-press', 10, 120, history, 'drop'), false);
  });
});

/**
 * `.208` — the PR that could never not happen.
 *
 * `estimateOneRepMax` returns 0 above 12 reps, because no 1RM formula is fitted
 * there. So `getBestPriorSet` can only ever return a set of 12 reps or fewer,
 * and for an athlete who trains high-rep only it returned **null forever** —
 * while `isPersonalRecord` answered `if (!prior) return true`.
 *
 * Goblet squats at 20kg x 20: a PR on set one, and a PR on set two hundred, with
 * the brass chip and the haptic every time, and `isPr` written into the log so it
 * is on the record too. A celebration that cannot fail to happen carries no
 * information.
 */
describe('high-rep histories', () => {
  const highRepLog = (id: string, reps: number): CompletedWorkoutLog =>
    ({
      id,
      name: 'Session',
      startedAt: '2026-07-01T10:00:00.000Z',
      completedAt: '2026-07-01T11:00:00.000Z',
      exercises: [
        { exerciseId: 'goblet-squat', sets: [{ id: `${id}-s1`, reps, weight: 20, completed: true }] },
      ],
    }) as unknown as CompletedWorkoutLog;

  it('does not call every high-rep set a record', () => {
    const history = [highRepLog('w1', 20), highRepLog('w2', 20)];
    assert.equal(
      isPersonalRecord('goblet-squat', 20, 20, history),
      false,
      'no 1RM formula covers a 20-rep set, so the app cannot know it is a record — ' +
        'and it used to say so on every single set, forever'
    );
  });

  it('still calls the first estimable set a record', () => {
    assert.equal(
      isPersonalRecord('bench-press', 5, 100, []),
      true,
      'a first set the app *can* estimate genuinely beats everything it can compare to'
    );
  });

  it('a high-rep history does not make a real lift a record by default', () => {
    // The prior 20-rep sets are invisible to the estimator, so the 5x100 below is
    // the first thing the app can measure — which is a real record, not a bug.
    const history = [highRepLog('w1', 20)];
    assert.equal(isPersonalRecord('goblet-squat', 5, 60, history), true);
  });
});
