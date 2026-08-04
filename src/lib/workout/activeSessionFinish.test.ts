import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  assembleActiveVictory,
  logSetIsPr,
  planLogSetRest,
} from './activeSessionFinish.ts';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..', '..');

function log(partial?: Partial<CompletedWorkoutLog>): CompletedWorkoutLog {
  return {
    id: 'w1',
    workoutName: 'Push',
    startedAt: '2026-08-04T10:00:00Z',
    completedAt: '2026-08-04T10:30:00Z',
    durationSeconds: 1800,
    totalVolume: 2000,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [
          { reps: 5, weight: 100 },
          { reps: 5, weight: 100 },
        ],
      },
    ],
    ...partial,
  };
}

describe('logSetIsPr + planLogSetRest', () => {
  it('names a PR from empty history and starts rest when more sets remain', () => {
    assert.equal(
      logSetIsPr({
        exerciseId: 'bench-press',
        reps: 5,
        weight: 100,
        setKind: 'normal',
        workoutHistory: [],
      }),
      true
    );
    const rest = planLogSetRest({
      exercisesAfterLog: [
        {
          exerciseId: 'bench-press',
          sets: [
            { id: 'a', reps: 5, weight: 100, completed: true },
            { id: 'b', reps: 5, weight: 100, completed: false },
          ],
        },
      ],
      exIdx: 0,
      setIdx: 0,
      advanceNext: { exerciseIndex: 0, setIndex: 1 },
      exerciseName: 'Barbell Bench Press',
    });
    assert.equal(rest.takeRest, true);
    assert.ok(rest.restSeconds >= 60);
  });

  it('skips rest when advanceNext is null (session complete)', () => {
    const rest = planLogSetRest({
      exercisesAfterLog: [
        {
          exerciseId: 'curl',
          sets: [{ id: 'a', reps: 10, weight: 20, completed: true }],
        },
      ],
      exIdx: 0,
      setIdx: 0,
      advanceNext: null,
      exerciseName: 'Curl',
    });
    assert.equal(rest.takeRest, false);
  });
});

describe('assembleActiveVictory', () => {
  it('builds victory + journal + push patch for an early log', () => {
    const finished = log();
    const out = assembleActiveVictory({
      log: finished,
      historyBefore: [],
      checkIn: null,
      sessionNote: 'Felt strong',
      units: 'metric',
      goalId: 'general',
      hasCoachPlan: true,
      resolveExerciseName: (id) => id,
    });
    assert.equal(out.historyAfter.length, 1);
    assert.equal(out.victorySummary.workoutName, 'Push');
    assert.equal(out.victorySummary.nextAction?.href, '/coach');
    assert.equal(out.pushPatch.lastSessionAt, finished.completedAt);
    assert.equal(out.journal.workoutId, finished.id);
    assert.ok(out.entry.fragments.some((f) => f.includes('Felt strong')));
  });
});

describe('Active page wiring (.405)', () => {
  it('ActiveWorkoutPage uses logSetIsPr, planLogSetRest, assembleActiveVictory', () => {
    const src = readFileSync(
      path.join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /logSetIsPr\(/);
    assert.match(src, /planLogSetRest\(/);
    assert.match(src, /assembleActiveVictory\(/);
    assert.doesNotMatch(
      src,
      /isPersonalRecord\(/,
      'PR detection must live inside logSetIsPr'
    );
    assert.doesNotMatch(
      src,
      /buildDebrief\(/,
      'debrief must live inside assembleActiveVictory'
    );
    assert.doesNotMatch(
      src,
      /shouldRestAfterLog\(/,
      'rest gate must live inside planLogSetRest'
    );
  });
});
