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
import { rememberLastRest } from '@/lib/workout/restTimer';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';
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

  it('preserves optional side on a unilateral set', () => {
    const payload = resolveLogSetPayload({
      exerciseId: 'lunges',
      set: { reps: 8, weight: 20, side: 'L' },
      dial: { reps: 8, weight: 20 },
    });
    assert.equal(payload?.side, 'L');
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

  it('uses recalled last rest for that exerciseId', () => {
    resetStorage();
    rememberLastRest('bench-press', 150);
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
      exerciseId: 'bench-press',
    });
    assert.equal(rest.takeRest, true);
    assert.equal(rest.restSeconds, 150);
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

  it('group round rest keys on the first peer, not A2', () => {
    resetStorage();
    rememberLastRest('bench-press', 180);
    rememberLastRest('bent-over-row', 60);
    const exercises = [
      {
        exerciseId: 'bench-press',
        supersetGroup: 'g1',
        sets: [
          { id: 'a1', reps: 5, weight: 100, completed: true },
          { id: 'a2', reps: 5, weight: 100, completed: false },
        ],
      },
      {
        exerciseId: 'bent-over-row',
        supersetGroup: 'g1',
        sets: [
          { id: 'b1', reps: 8, weight: 60, completed: true },
          { id: 'b2', reps: 8, weight: 60, completed: false },
        ],
      },
    ];
    const mid = planLogSetRest({
      exercisesAfterLog: exercises,
      exIdx: 0,
      setIdx: 0,
      advanceNext: { exerciseIndex: 1, setIndex: 0 },
      exerciseName: 'Barbell Bench Press',
      exerciseId: 'bench-press',
    });
    assert.equal(mid.takeRest, false);

    const end = planLogSetRest({
      exercisesAfterLog: exercises,
      exIdx: 1,
      setIdx: 0,
      advanceNext: { exerciseIndex: 0, setIndex: 1 },
      exerciseName: 'Bent Over Row',
      exerciseId: 'bent-over-row',
      groupLeadName: 'Barbell Bench Press',
    });
    assert.equal(end.takeRest, true);
    assert.equal(end.restSeconds, 180);
    assert.equal(end.rememberExerciseId, 'bench-press');
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
    assert.equal(out.victorySummary.receipt.exercises.length, 1);
    assert.equal(out.victorySummary.receipt.vsLast, null);
  });

  it('attaches vs-last on the receipt when a prior same-shape log exists', () => {
    const prior = log({
      id: 'w0',
      startedAt: '2026-08-03T10:00:00Z',
      completedAt: '2026-08-03T10:25:00Z',
      durationSeconds: 1500,
      totalVolume: 1800,
    });
    const finished = log({ totalVolume: 2200, durationSeconds: 1900 });
    const out = assembleActiveVictory({
      log: finished,
      historyBefore: [prior],
      checkIn: null,
      sessionNote: '',
      units: 'metric',
      goalId: 'general',
      hasCoachPlan: true,
      resolveExerciseName: (id) => id,
    });
    const vsLast = out.victorySummary.receipt?.vsLast;
    assert.ok(vsLast);
    assert.equal(vsLast.volumeDelta, 400);
  });

  it('attaches vs-last when the prior session has the same lifts under a different name', () => {
    const prior = log({
      id: 'w0',
      workoutName: 'Week 2 Push',
      startedAt: '2026-08-03T10:00:00Z',
      completedAt: '2026-08-03T10:25:00Z',
      durationSeconds: 1500,
      totalVolume: 1800,
    });
    const finished = log({
      workoutName: 'Week 3 Push',
      totalVolume: 2200,
      durationSeconds: 1900,
    });
    const out = assembleActiveVictory({
      log: finished,
      historyBefore: [prior],
      checkIn: null,
      sessionNote: '',
      units: 'metric',
      goalId: 'general',
      hasCoachPlan: true,
      resolveExerciseName: (id) => id,
    });
    assert.ok(out.victorySummary.receipt?.vsLast);
    assert.equal(out.victorySummary.receipt.vsLast.volumeDelta, 400);
  });

  it('0-set log attaches no close receipt', () => {
    const empty = log({ exercises: [], totalVolume: 0, durationSeconds: 0 });
    const out = assembleActiveVictory({
      log: empty,
      historyBefore: [],
      checkIn: null,
      sessionNote: '',
      units: 'metric',
      goalId: 'general',
      hasCoachPlan: false,
      resolveExerciseName: (id) => id,
    });
    assert.equal(out.victorySummary.receipt, undefined);
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
    const finish = readFileSync(
      path.join(root, 'src/lib/workout/activeSessionFinish.ts'),
      'utf8'
    );
    assert.match(finish, /buildCloseReceipt\(/);
    assert.doesNotMatch(finish, /SignInPrompt|getUser\(/);
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
    assert.doesNotMatch(src, /SignInPrompt|getUser\(/, 'guest sees Victory without a login wall');
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
