import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  assembleActiveVictory,
  finishBlockedReason,
  logSetIsPr,
  nothingLoggedToastCopy,
  planLogSetRest,
  planPrHaptic,
  PR_HAPTIC_PATTERN,
  resolveLogSetPayload,
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

describe('resolveLogSetPayload', () => {
  it('returns null without exercise or set', () => {
    assert.equal(
      resolveLogSetPayload({
        exerciseId: undefined,
        set: { reps: 5, weight: 100 },
        dial: { reps: 5, weight: 100 },
      }),
      null
    );
    assert.equal(
      resolveLogSetPayload({
        exerciseId: 'bench',
        set: undefined,
        dial: { reps: 5, weight: 100 },
      }),
      null
    );
  });

  it('prefers override over dial and defaults kind', () => {
    const payload = resolveLogSetPayload({
      exerciseId: 'bench',
      set: { reps: 5, weight: 100 },
      override: { reps: 3, weight: 120 },
      dial: { reps: 5, weight: 100 },
    });
    assert.deepEqual(payload, {
      exerciseId: 'bench',
      setKind: 'normal',
      input: { reps: 3, weight: 120 },
    });
  });

  it('uses dial when no override and preserves kind', () => {
    const payload = resolveLogSetPayload({
      exerciseId: 'squat',
      set: { reps: 5, weight: 140, kind: 'warmup' },
      dial: { reps: 5, weight: 140 },
    });
    assert.equal(payload?.setKind, 'warmup');
    assert.deepEqual(payload?.input, { reps: 5, weight: 140 });
  });
});

describe('planPrHaptic + nothingLoggedToastCopy', () => {
  it('returns pattern only for PRs', () => {
    assert.equal(planPrHaptic(false), null);
    assert.deepEqual(planPrHaptic(true), [...PR_HAPTIC_PATTERN]);
  });

  it('empty finish toast is guidance with stable keys', () => {
    const copy = nothingLoggedToastCopy();
    assert.equal(copy.variant, 'default');
    assert.equal(copy.titleKey, 'activeNothingLogged');
    assert.equal(copy.descKey, 'activeNothingLoggedDesc');
    assert.match(copy.titleDefault, /set/i);
  });

  it('finishBlockedReason is no_sets until a set is completed', () => {
    assert.equal(finishBlockedReason(null), 'no_sets');
    assert.equal(finishBlockedReason([]), 'no_sets');
    assert.equal(
      finishBlockedReason([
        {
          sets: [
            { completed: false },
            { completed: false },
          ],
        },
      ]),
      'no_sets'
    );
    assert.equal(
      finishBlockedReason([
        {
          sets: [
            { completed: true },
            { completed: false },
          ],
        },
      ]),
      null
    );
  });
});

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
    // First completed session → session-2 train (`.412`), not Coach.
    assert.equal(out.victorySummary.nextAction?.href, '/active');
    assert.equal(out.victorySummary.nextAction?.labelKey, 'week1SecondSessionCta');
    assert.equal(out.pushPatch.lastSessionAt, finished.completedAt);
    assert.equal(out.journal.workoutId, finished.id);
    assert.ok(out.entry.fragments.some((f) => f.includes('Felt strong')));
    assert.ok(out.victorySummary.receipt);
    assert.equal(out.victorySummary.receipt!.vsLast, null);
    assert.equal(out.victorySummary.receipt!.prCount, 0);
  });

  it('same-day second session attaches vs-last volume from historyBefore (.713)', () => {
    const first = log({
      id: 'w0',
      completedAt: '2026-08-13T16:00:00.000Z',
      startedAt: '2026-08-13T15:30:00.000Z',
      totalVolume: 800,
    });
    const second = log({
      id: 'w1',
      completedAt: '2026-08-13T18:00:00.000Z',
      startedAt: '2026-08-13T17:30:00.000Z',
      totalVolume: 1100,
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [
            { reps: 5, weight: 105 },
            { reps: 5, weight: 105 },
          ],
        },
      ],
    });
    const out = assembleActiveVictory({
      log: second,
      historyBefore: [first],
      checkIn: null,
      sessionNote: '',
      units: 'metric',
      goalId: 'general',
      hasCoachPlan: true,
      resolveExerciseName: (id) => id,
    });
    assert.equal(out.victorySummary.receipt?.vsLast?.volumeDelta, 300);
    assert.ok((out.victorySummary.receipt?.prCount ?? 0) > 0);
  });
});

describe('Active page wiring (.405/.409)', () => {
  it('ActiveWorkoutPage uses session-finish helpers', () => {
    const src = readFileSync(
      path.join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /logSetIsPr\(/);
    assert.match(src, /planLogSetRest\(/);
    assert.match(src, /assembleActiveVictory\(/);
    assert.match(src, /resolveLogSetPayload\(/);
    assert.match(src, /planPrHaptic\(/);
    assert.match(src, /nothingLoggedToastCopy\(/);
    assert.match(src, /finishBlockedReason\(/);
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
    assert.match(
      readFileSync(path.join(root, 'src/lib/workout/activeSessionFinish.ts'), 'utf8'),
      /buildVictoryReceipt\(params\.log, params\.historyBefore/
    );
    assert.doesNotMatch(
      src,
      /buildVictoryReceipt\(/,
      'receipt must live inside assembleActiveVictory'
    );
    assert.doesNotMatch(
      src,
      /shouldRestAfterLog\(/,
      'rest gate must live inside planLogSetRest'
    );
    assert.doesNotMatch(
      src,
      /vibrate\(\[80,\s*40,\s*80\]\)/,
      'PR haptic pattern must live inside planPrHaptic'
    );
  });
});
