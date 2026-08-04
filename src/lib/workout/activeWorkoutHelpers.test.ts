import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildConsoleSet,
  findNextSet,
  getLastPerformanceForSet,
  getLastSessionSets,
  nextSetInput,
  planApplyTargets,
  priorCompletedInExercise,
  resolveActiveDockMode,
  resolveActiveSetDial,
  resolveFormGuideSheet,
  resolveRepeatLastTarget,
  shouldOfferVolumeTrim,
  resolveSetInput,
  formatLoggedSetLine,
  sessionIsCoachPrescribed,
  sessionSetStats,
  setInputKey,
  rankSwapCandidates,
  bodyScoreDeltas,
  resolveSwapCandidatesWhenOpen,
  activeSessionBottomClass,
  shouldShowReadinessDelta,
} from './activeWorkoutHelpers.ts';
import type { CompletedWorkoutLog } from '@/types';

function historyWith(
  exerciseId: string,
  sets: { reps: number; weight: number }[]
): CompletedWorkoutLog[] {
  return [
    {
      id: 'h1',
      workoutName: 'Past',
      startedAt: '2026-07-01T10:00:00Z',
      completedAt: '2026-07-01T11:00:00Z',
      durationSeconds: 3600,
      totalVolume: 100,
      exercises: [
        {
          exerciseId,
          sets: sets.map((s) => ({ ...s, kind: 'normal' as const })),
        },
      ],
    },
  ];
}

describe('sessionIsCoachPrescribed', () => {
  it('is true when any exercise carries prescribed', () => {
    assert.equal(
      sessionIsCoachPrescribed([{ prescribed: true }, { prescribed: false }]),
      true
    );
  });

  it('is false for freestyle sessions', () => {
    assert.equal(sessionIsCoachPrescribed([{}, { prescribed: false }]), false);
    assert.equal(sessionIsCoachPrescribed([]), false);
  });
});

describe('activeWorkoutHelpers', () => {
  it('findNextSet returns first incomplete set', () => {
    const exercises = [
      {
        sets: [
          { completed: true },
          { completed: true },
        ],
      },
      {
        sets: [{ completed: true }, { completed: false }],
      },
    ];
    assert.deepEqual(findNextSet(exercises), { exIdx: 1, setIdx: 1 });
  });

  it('findNextSet returns null when all complete', () => {
    assert.equal(findNextSet([{ sets: [{ completed: true }] }]), null);
  });

  it('getLastSessionSets finds most recent matching exercise', () => {
    const hist = historyWith('squats', [
      { reps: 5, weight: 100 },
      { reps: 5, weight: 105 },
    ]);
    const sets = getLastSessionSets(hist, 'squats');
    assert.equal(sets?.length, 2);
    assert.equal(sets?.[1].weight, 105);
    assert.equal(getLastSessionSets(hist, 'missing'), null);
  });

  it('getLastPerformanceForSet matches set index then falls back', () => {
    const hist = historyWith('bench-press', [
      { reps: 8, weight: 60 },
      { reps: 6, weight: 65 },
    ]);
    assert.deepEqual(getLastPerformanceForSet(hist, 'bench-press', 0), {
      reps: 8,
      weight: 60,
    });
    assert.deepEqual(getLastPerformanceForSet(hist, 'bench-press', 5), {
      reps: 6,
      weight: 65,
    });
    assert.equal(getLastPerformanceForSet(hist, 'none', 0), null);
  });

  it('setInputKey is stable', () => {
    assert.equal(setInputKey(2, 3), '2-3');
  });

  it('sessionSetStats counts completed, total, and hard RPE', () => {
    const stats = sessionSetStats([
      {
        sets: [
          { completed: true, rpe: 'easy' },
          { completed: true, rpe: 'hard' },
          { completed: false },
        ],
      },
      {
        sets: [{ completed: true, rpe: 'hard' }],
      },
    ]);
    assert.deepEqual(stats, { completed: 3, total: 4, hardCount: 2 });
  });
});

describe('resolveSetInput', () => {
  const base = { defaultReps: 5, defaultWeight: 85 };

  it('the coach prescription wins over the logger suggestion', () => {
    // The bug: a strength plan of 3x5 @ 85 used to prefill as 6 reps, because
    // suggestNextSetTarget assumed 8-12 for everyone and ran first.
    const out = resolveSetInput({
      ...base,
      prescribed: true,
      suggestion: { reps: 6, weight: 85 },
      lastPerformance: { reps: 6, weight: 85 },
    });
    assert.deepEqual(out, { reps: 5, weight: 85 });
  });

  it('a deload prescription is not talked out of', () => {
    const out = resolveSetInput({
      defaultReps: 5,
      defaultWeight: 90,
      prescribed: true,
      suggestion: { reps: 5, weight: 100 },
    });
    assert.equal(out.weight, 90, 'the back-off weight must survive');
  });

  it('freestyle work still gets the suggestion', () => {
    const out = resolveSetInput({
      ...base,
      prescribed: false,
      suggestion: { reps: 9, weight: 80 },
      lastPerformance: { reps: 8, weight: 80 },
    });
    assert.deepEqual(out, { reps: 9, weight: 80 });
  });

  it('same-session carry beats last-session suggestion (gym speed)', () => {
    // Logged set 1 as 9×82 today; set 2 dial must not jump back to last week's set 2.
    const out = resolveSetInput({
      ...base,
      prescribed: false,
      sessionCarry: { reps: 9, weight: 82 },
      suggestion: { reps: 8, weight: 80 },
      lastPerformance: { reps: 8, weight: 80 },
    });
    assert.deepEqual(out, { reps: 9, weight: 82 });
  });

  it('coach prescription still beats same-session carry', () => {
    const out = resolveSetInput({
      ...base,
      prescribed: true,
      sessionCarry: { reps: 9, weight: 82 },
      suggestion: { reps: 9, weight: 82 },
    });
    assert.deepEqual(out, { reps: 5, weight: 85 });
  });

  it('what the athlete typed always wins, prescribed or not', () => {
    const manual = { reps: 3, weight: 120 };
    assert.deepEqual(
      resolveSetInput({ ...base, manual, prescribed: true, suggestion: { reps: 9, weight: 70 } }),
      manual
    );
    assert.deepEqual(
      resolveSetInput({ ...base, manual, prescribed: false, suggestion: { reps: 9, weight: 70 } }),
      manual
    );
  });

  it('falls back through last performance to the template default', () => {
    assert.deepEqual(
      resolveSetInput({ ...base, suggestion: null, lastPerformance: { reps: 7, weight: 75 } }),
      { reps: 7, weight: 75 }
    );
    assert.deepEqual(resolveSetInput({ ...base, suggestion: null, lastPerformance: null }), {
      reps: 5,
      weight: 85,
    });
  });
});

describe('priorCompletedInExercise', () => {
  it('returns the nearest completed set before setIdx', () => {
    const sets = [
      { completed: true, reps: 8, weight: 60 },
      { completed: true, reps: 9, weight: 62 },
      { completed: false, reps: 10, weight: 0 },
    ];
    assert.deepEqual(priorCompletedInExercise(sets, 2), { reps: 9, weight: 62 });
    assert.deepEqual(priorCompletedInExercise(sets, 1), { reps: 8, weight: 60 });
    assert.equal(priorCompletedInExercise(sets, 0), null);
  });

  it('skips incomplete earlier sets', () => {
    const sets = [
      { completed: false, reps: 10, weight: 50 },
      { completed: true, reps: 8, weight: 55 },
      { completed: false, reps: 10, weight: 0 },
    ];
    assert.deepEqual(priorCompletedInExercise(sets, 2), { reps: 8, weight: 55 });
  });
});

describe('formatLoggedSetLine', () => {
  it('prints BW instead of 0 kg for bodyweight sets', () => {
    assert.equal(formatLoggedSetLine(8, 0, 'kg'), '8 × BW');
    assert.equal(formatLoggedSetLine(8, 0, 'kg', 'BW'), '8 × BW');
  });

  it('keeps weighted sets with the unit label', () => {
    assert.equal(formatLoggedSetLine(5, 100, 'kg'), '5 × 100 kg');
  });
});

/**
 * `.206` — the composition, which is where the bug lived.
 *
 * `resolveSetInput` above is thoroughly covered and was never wrong. What broke
 * was what `updateSetInput` fed it: `getSetInput(exIdx, setIdx, 10, 0)`, so a
 * prescribed set resolved to the hardcoded defaults and one edited field
 * silently rewrote the other. A unit test of a correct function cannot see a
 * caller passing it the wrong arguments — that is the whole reason these exist.
 */
describe('nextSetInput', () => {
  it('changes only the edited field', () => {
    const out = nextSetInput({
      resolved: { reps: 5, weight: 100 },
      field: 'reps',
      value: 6,
    });
    assert.deepEqual(
      out,
      { reps: 6, weight: 100 },
      'editing reps on a prescribed 3x5 @ 100kg must not zero the weight'
    );
  });

  it('changes only the edited field the other way round', () => {
    const out = nextSetInput({
      resolved: { reps: 5, weight: 100 },
      field: 'weight',
      value: 102.5,
    });
    assert.deepEqual(out, { reps: 5, weight: 102.5 });
  });

  /**
   * The stale-closure half. "Apply targets" fires two synchronous calls per set
   * — reps then weight — and the second used to read `setInputs` from the render
   * closure, so it rebuilt from a base that did not yet contain the reps the
   * first call had just set. A 3x5 prescription prefilled as 10 reps, which is
   * verbatim the `.175` bug its own comment claims was fixed.
   */
  it('builds on the athlete\'s previous edit, not on the resolved default', () => {
    const first = nextSetInput({
      resolved: { reps: 10, weight: 0 },
      field: 'reps',
      value: 5,
    });
    const second = nextSetInput({
      prevManual: first,
      resolved: { reps: 10, weight: 0 },
      field: 'weight',
      value: 100,
    });
    assert.deepEqual(
      second,
      { reps: 5, weight: 100 },
      'the second of two synchronous updates must see the first'
    );
  });

  it('never returns a partial pair', () => {
    const out = nextSetInput({ resolved: { reps: 8, weight: 60 }, field: 'reps', value: 0 });
    assert.equal(typeof out.reps, 'number');
    assert.equal(typeof out.weight, 'number');
    assert.equal(out.weight, 60, 'a zero in one field is an edit, not a reason to drop the other');
  });
});

/**
 * And the call site, because the defect was an argument list. `getSetInput`'s
 * other four call sites all pass `set.reps, set.weight`; only `updateSetInput`
 * passed `10, 0`, and that single disagreement is the entire bug.
 */
describe('the updateSetInput call site', () => {
  it('resolves against the set, not against hardcoded defaults', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    const body = src.slice(src.indexOf('const updateSetInput ='), src.indexOf('const consoleSet'));
    assert.doesNotMatch(
      body,
      /getSetInput\([^)]*,\s*10\s*,\s*0\s*\)/,
      'updateSetInput resolves with hardcoded 10/0 — for a prescribed exercise resolveSetInput ' +
        'returns those verbatim, so editing one field zeroes the other'
    );
    assert.match(body, /set\?\.reps/, 'the base must come from the set being edited');
    assert.match(body, /prevManual:\s*prev\[key\]/, 'the base must come from `prev`, not the render closure');
  });
});

describe('rankSwapCandidates', () => {
  const catalog = [
    { id: 'a', name: 'Zebra Press', muscleGroups: ['Chest'] },
    { id: 'b', name: 'Alpha Curl', muscleGroups: ['Arms'] },
    { id: 'c', name: 'Bench Press', muscleGroups: ['Chest'] },
    { id: 'current', name: 'Current', muscleGroups: ['Chest'] },
  ];

  it('excludes the current exercise and prefers shared muscle groups', () => {
    const ranked = rankSwapCandidates(catalog, catalog[3]!, (a, b) => a.localeCompare(b));
    assert.deepEqual(
      ranked.map((e) => e.id),
      ['c', 'a', 'b']
    );
  });

  it('ActiveWorkoutPage uses resolveSwapCandidatesWhenOpen rather than an open-idx ternary', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /resolveSwapCandidatesWhenOpen\(/);
    assert.doesNotMatch(
      src,
      /rankSwapCandidates\(/,
      'page must call resolveSwapCandidatesWhenOpen, not rankSwapCandidates directly'
    );
    assert.doesNotMatch(
      src,
      /aShared !== bShared/,
      'inline muscle-share sort returned — keep one definition in activeWorkoutHelpers'
    );
  });
});

describe('resolveSwapCandidatesWhenOpen', () => {
  const catalog = [
    { id: 'a', name: 'Zebra Press', muscleGroups: ['Chest'] },
    { id: 'b', name: 'Alpha Curl', muscleGroups: ['Arms'] },
    { id: 'c', name: 'Bench Press', muscleGroups: ['Chest'] },
    { id: 'current', name: 'Current', muscleGroups: ['Chest'] },
  ];

  it('returns [] when this exercise does not own the open swap UI', () => {
    assert.deepEqual(
      resolveSwapCandidatesWhenOpen({
        swapOpenIdx: 0,
        exIdx: 1,
        catalog,
        current: catalog[3]!,
        compareNames: (a, b) => a.localeCompare(b),
      }),
      []
    );
  });

  it('ranks when this exercise owns the open swap UI', () => {
    const ranked = resolveSwapCandidatesWhenOpen({
      swapOpenIdx: 2,
      exIdx: 2,
      catalog,
      current: catalog[3]!,
      compareNames: (a, b) => a.localeCompare(b),
    });
    assert.deepEqual(
      ranked.map((e) => e.id),
      ['c', 'a', 'b']
    );
  });
});

describe('buildConsoleSet', () => {
  it('returns null when there is no next set', () => {
    assert.equal(
      buildConsoleSet({
        exercises: [],
        nextSet: null,
        workoutHistory: [],
        units: 'metric',
        goalId: 'general',
        unitLabel: 'kg',
        bodyweightLabel: 'BW',
        resolveExerciseName: (id) => id,
        resolveInput: (_e, _s, r, w) => ({ reps: r, weight: w }),
        translateReason: (_k, d) => d,
      }),
      null
    );
  });

  it('uses prescribed numbers and a prescribed reason for coach sets', () => {
    const view = buildConsoleSet({
      exercises: [
        {
          exerciseId: 'bench-press',
          prescribed: true,
          sets: [{ reps: 5, weight: 100, completed: false, kind: 'normal' }],
        },
      ],
      nextSet: { exIdx: 0, setIdx: 0 },
      workoutHistory: historyWith('bench-press', [{ reps: 8, weight: 80 }]),
      units: 'metric',
      goalId: 'strength',
      unitLabel: 'kg',
      bodyweightLabel: 'BW',
      resolveExerciseName: () => 'Bench Press',
      resolveInput: (_e, _s, r, w) => ({ reps: r, weight: w }),
      translateReason: (key) => key,
    });
    assert.ok(view);
    assert.equal(view!.exerciseName, 'Bench Press');
    assert.equal(view!.input.reps, 5);
    assert.equal(view!.input.weight, 100);
    assert.equal(view!.overloadCue.nextTarget?.reps, 5);
    assert.equal(view!.overloadCue.nextTarget?.weight, 100);
    assert.equal(view!.overloadCue.reasonLine, 'activeOverloadPrescribed');
    assert.equal(view!.overloadCue.nextLine, '5 × 100 kg');
  });

  it('ActiveWorkoutPage uses buildConsoleSet rather than an inline IIFE', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /buildConsoleSet\(/);
    assert.doesNotMatch(
      src,
      /buildOverloadCue\(/,
      'console overload cue must stay in the helper — not re-inlined on the page'
    );
  });
});

describe('planApplyTargets', () => {
  it('applies prescription to incomplete sets only', () => {
    const targets = planApplyTargets({
      prescribed: true,
      sets: [
        { completed: true, reps: 5, weight: 100 },
        { completed: false, reps: 5, weight: 105 },
      ],
      lastSets: [{ reps: 8, weight: 60 }],
      units: 'metric',
      repMin: 8,
      repMax: 12,
    });
    assert.deepEqual(targets, [{ setIdx: 1, reps: 5, weight: 105 }]);
  });

  it('returns empty when freestyle has no history', () => {
    assert.deepEqual(
      planApplyTargets({
        prescribed: false,
        sets: [{ completed: false, reps: 10, weight: 0 }],
        lastSets: null,
        units: 'metric',
        repMin: 8,
        repMax: 12,
      }),
      []
    );
  });

  it('ActiveWorkoutPage uses planApplyTargets for Apply targets', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /planApplyTargets\(/);
  });
});

describe('resolveActiveSetDial', () => {
  it('prescribed ignores history and returns template numbers', () => {
    const out = resolveActiveSetDial({
      prescribed: true,
      defaultReps: 5,
      defaultWeight: 100,
      sets: [
        { completed: true, reps: 5, weight: 100 },
        { completed: false, reps: 5, weight: 100 },
      ],
      setIdx: 1,
      lastSets: [{ reps: 12, weight: 60 }],
      units: 'metric',
      repMin: 8,
      repMax: 12,
      lastPerformance: { reps: 12, weight: 60 },
    });
    assert.deepEqual(out, { reps: 5, weight: 100 });
  });

  it('freestyle carries the prior completed set in this exercise', () => {
    const out = resolveActiveSetDial({
      prescribed: false,
      defaultReps: 10,
      defaultWeight: 0,
      sets: [
        { completed: true, reps: 8, weight: 70 },
        { completed: false, reps: 10, weight: 0 },
      ],
      setIdx: 1,
      lastSets: [{ reps: 6, weight: 65 }],
      units: 'metric',
      repMin: 8,
      repMax: 12,
      lastPerformance: { reps: 6, weight: 65 },
    });
    assert.deepEqual(out, { reps: 8, weight: 70 });
  });

  it('ActiveWorkoutPage uses resolveActiveSetDial rather than inlining carry', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /resolveActiveSetDial\(/);
    assert.doesNotMatch(
      src,
      /priorCompletedInExercise\(/,
      'session carry must stay inside resolveActiveSetDial'
    );
  });
});

describe('resolveRepeatLastTarget', () => {
  it('copies the last completed set onto the next open slot', () => {
    const out = resolveRepeatLastTarget({
      sets: [
        { completed: true, reps: 8, weight: 100 },
        { completed: true, reps: 7, weight: 105 },
        { completed: false, reps: 10, weight: 0 },
      ],
    });
    assert.deepEqual(out, { setIdx: 2, reps: 7, weight: 105 });
  });

  it('returns null when nothing is completed or every set is done', () => {
    assert.equal(
      resolveRepeatLastTarget({
        sets: [
          { completed: false, reps: 10, weight: 0 },
          { completed: false, reps: 10, weight: 0 },
        ],
      }),
      null
    );
    assert.equal(
      resolveRepeatLastTarget({
        sets: [{ completed: true, reps: 5, weight: 50 }],
      }),
      null
    );
  });

  it('ActiveWorkoutPage uses resolveRepeatLastTarget rather than inlining reverse-find', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /resolveRepeatLastTarget\(/);
    assert.doesNotMatch(
      src,
      /\.reverse\(\)\.find\(\(s\) => s\.completed\)/,
      'repeat-last must stay inside resolveRepeatLastTarget'
    );
  });
});

describe('resolveActiveDockMode', () => {
  it('rest wins over console', () => {
    assert.equal(
      resolveActiveDockMode({ restTimerActive: true, hasConsoleSet: true, isCompact: true }),
      'rest'
    );
  });

  it('console only when compact and a set is open', () => {
    assert.equal(
      resolveActiveDockMode({ restTimerActive: false, hasConsoleSet: true, isCompact: true }),
      'console'
    );
    assert.equal(
      resolveActiveDockMode({ restTimerActive: false, hasConsoleSet: true, isCompact: false }),
      null
    );
    assert.equal(
      resolveActiveDockMode({ restTimerActive: false, hasConsoleSet: false, isCompact: true }),
      null
    );
  });

  it('ActiveWorkoutPage uses resolveActiveDockMode rather than nesting rest/console ternaries', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /resolveActiveDockMode\(/);
    assert.doesNotMatch(
      src,
      /restTimerActive\s*\?\s*\([\s\S]*?consoleSet\s*&&\s*isCompact/,
      'dock mode decision must stay inside resolveActiveDockMode'
    );
  });
});

describe('resolveFormGuideSheet', () => {
  it('returns null without an id or when the catalog misses', () => {
    assert.equal(
      resolveFormGuideSheet({
        formGuideId: null,
        getExerciseById: () => undefined,
        getFormGuideOrCues: () => null,
      }),
      null
    );
    assert.equal(
      resolveFormGuideSheet({
        formGuideId: 'missing',
        getExerciseById: () => undefined,
        getFormGuideOrCues: () => ({ setup: [] }),
      }),
      null
    );
  });

  it('returns sheet props when exercise and guide exist', () => {
    const out = resolveFormGuideSheet({
      formGuideId: 'push-ups',
      getExerciseById: (id) => ({ id, name: 'Push-ups' }),
      getFormGuideOrCues: () => ({ setup: ['hands under shoulders'] }),
    });
    assert.deepEqual(out, {
      exerciseId: 'push-ups',
      exerciseName: 'Push-ups',
      guide: { setup: ['hands under shoulders'] },
    });
  });

  it('ActiveWorkoutPage uses resolveFormGuideSheet rather than an inline IIFE', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /resolveFormGuideSheet\(/);
    assert.doesNotMatch(
      src,
      /getFormGuideOrCues\(formGuideId/,
      'form guide lookup must stay inside resolveFormGuideSheet'
    );
  });
});

describe('shouldOfferVolumeTrim', () => {
  it('requires a completed check-in under the readiness threshold', () => {
    assert.equal(
      shouldOfferVolumeTrim({ checkInCompleted: true, readinessAfter: 39 }),
      true
    );
    assert.equal(
      shouldOfferVolumeTrim({ checkInCompleted: true, readinessAfter: 40 }),
      false
    );
    assert.equal(
      shouldOfferVolumeTrim({ checkInCompleted: false, readinessAfter: 10 }),
      false
    );
  });

  it('ActiveWorkoutPage uses shouldOfferVolumeTrim rather than inlining the threshold', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /shouldOfferVolumeTrim\(/);
    assert.doesNotMatch(
      src,
      /completed\s*&&\s*adj\.readiness\s*<\s*40/,
      'volume-trim threshold must stay inside shouldOfferVolumeTrim'
    );
  });
});

describe('bodyScoreDeltas', () => {
  it('subtracts before from after for readiness, strain, recovery', () => {
    assert.deepEqual(
      bodyScoreDeltas(
        { readiness: 50, strain: 40, recovery: 60 },
        { readiness: 55, strain: 48, recovery: 58 }
      ),
      { readiness: 5, strain: 8, recovery: -2 }
    );
  });

  it('ActiveWorkoutPage uses bodyScoreDeltas rather than inlining Victory deltas', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /bodyScoreDeltas\(/);
    assert.doesNotMatch(
      src,
      /afterScores\.readiness\s*-\s*beforeScores\.readiness/,
      'Victory body-score deltas must stay inside bodyScoreDeltas'
    );
  });
});

describe('activeSessionBottomClass', () => {
  it('pads for the rest dock when the timer is active', () => {
    assert.equal(activeSessionBottomClass(true), 'pb-36 md:pb-28');
    assert.equal(activeSessionBottomClass(false), 'pb-4');
  });

  it('ActiveWorkoutPage uses activeSessionBottomClass rather than an inline rest pad ternary', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /activeSessionBottomClass\(/);
    assert.doesNotMatch(
      src,
      /restTimerActive\s*\?\s*['"]pb-36/,
      'rest pad class must stay inside activeSessionBottomClass'
    );
  });
});

describe('shouldShowReadinessDelta', () => {
  it('requires both scores and a real change', () => {
    assert.equal(shouldShowReadinessDelta(50, 55), true);
    assert.equal(shouldShowReadinessDelta(50, 50), false);
    assert.equal(shouldShowReadinessDelta(null, 55), false);
    assert.equal(shouldShowReadinessDelta(50, null), false);
  });

  it('ActiveWorkoutPage uses shouldShowReadinessDelta rather than inlining null checks', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /shouldShowReadinessDelta\(/);
    assert.doesNotMatch(
      src,
      /readinessAfter\s*!=\s*null\s*&&\s*readinessBefore\s*!=\s*null/,
      'readiness delta visibility must stay inside shouldShowReadinessDelta'
    );
  });
});
