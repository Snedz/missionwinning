import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildConsoleSet,
  findNextSet,
  getLastPerformanceForSet,
  getLastSessionSets,
  formatPrevSetLabels,
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
  shouldShowVolumeTrimOffer,
  resolveActiveGoalId,
  activeSessionHasExercises,
  activePostSessionPath,
  sessionSetsProgressPct,
  activeCoachTipKind,
  toggleOpenIdx,
  isOpenIdx,
  exerciseHasCompletedSet,
  laterLiftVisible,
  exerciseHasPlannedSet,
  firstPlannedSetIdx,
  holdsActiveExercise,
  isActiveSetCell,
  activeSetIdxForExercise,
  shouldShowSetOptionsFooter,
  shouldShowApplyTargetsMenuitem,
  shouldShowRemoveSetMenuitem,
  exerciseHasWeightedSet,
  firstWeightedLoad,
  shouldShowLoadPctChip,
  shouldShowSupersetLinkMenuitem,
  shouldShowExerciseSwapMenuitem,
  resolveExerciseNextTarget,
} from './activeWorkoutHelpers.ts';
import type { CompletedWorkoutLog } from '@/types';

function historyWith(
  exerciseId: string,
  sets: { reps: number; weight: number; kind?: 'normal' | 'warmup' | 'failure' | 'drop' }[]
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
          sets: sets.map((s) => ({ ...s, kind: s.kind ?? ('normal' as const) })),
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

  it('getLastSessionSets skips tombstones and 0-rep junk — one last-live reader (#487 leftover)', () => {
    const live = historyWith('squats', [{ reps: 5, weight: 80 }]);
    const dead = historyWith('squats', [{ reps: 5, weight: 999 }]);
    dead[0] = { ...dead[0]!, id: 'dead', deletedAt: new Date().toISOString() };
    const zero = historyWith('squats', [{ reps: 0, weight: 200 }]);
    zero[0] = { ...zero[0]!, id: 'zero' };
    const sets = getLastSessionSets([dead[0]!, zero[0]!, live[0]!], 'squats');
    assert.equal(sets?.[0]?.weight, 80);
  });

  it('getLastSessionSets uses lastLiveSessionForExercise — no second last-session loop', () => {
    const helpers = readFileSync(
      path.join(import.meta.dirname, 'activeWorkoutHelpers.ts'),
      'utf8'
    );
    const code = helpers.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.match(code, /from ['"]@\/lib\/workout\/setRowAdjacency['"]/);
    assert.match(code, /lastLiveSessionForExercise\(/);
    const privateLoop = /for \(const log of workoutHistory\)[\s\S]*exerciseId/;
    const fn = code.slice(code.indexOf('export function getLastSessionSets'));
    const body = fn.slice(0, fn.indexOf('export function getLastPerformanceForSet'));
    assert.doesNotMatch(body, privateLoop);
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

  it('getLastPerformanceForSet / Prev ignore warmup-tagged last-session sets', () => {
    const hist = historyWith('bench-press', [
      { reps: 8, weight: 40, kind: 'warmup' },
      { reps: 5, weight: 100, kind: 'normal' },
    ]);
    assert.deepEqual(getLastPerformanceForSet(hist, 'bench-press', 0), {
      reps: 5,
      weight: 100,
    });
    assert.equal(
      getLastPerformanceForSet(hist, 'bench-press', 0, [{ kind: 'warmup' }, { kind: 'normal' }]),
      null,
      'warmup row stays quiet'
    );
    assert.deepEqual(
      getLastPerformanceForSet(hist, 'bench-press', 1, [{ kind: 'warmup' }, { kind: 'normal' }]),
      { reps: 5, weight: 100 }
    );
    assert.deepEqual(formatPrevSetLabels(hist, 'bench-press', 2, {
      currentSets: [{ kind: 'warmup' }, { kind: 'normal' }],
    }), [null, '5 × 100']);
  });

  it('formatPrevSetLabels builds table prev column (.425)', () => {
    const hist = historyWith('bench-press', [
      { reps: 8, weight: 60 },
      { reps: 6, weight: 65 },
    ]);
    assert.deepEqual(formatPrevSetLabels(hist, 'bench-press', 3), [
      '8 × 60',
      '6 × 65',
      '6 × 65',
    ]);
    assert.deepEqual(formatPrevSetLabels(hist, 'none', 2), [null, null]);
    const dipHist = historyWith('pull-ups', [{ reps: 8, weight: 20 }]);
    assert.deepEqual(formatPrevSetLabels(dipHist, 'pull-ups', 1, { plusLoad: true }), [
      '8 × BW+20',
    ]);
    const card = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseCard.tsx'),
      'utf8'
    );
    assert.match(card, /formatPrevSetLabels\(/);
    assert.doesNotMatch(card, /getLastPerformanceForSet\(/);
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

  it('H-05: the athlete\'s last stored set beats a suggestion', () => {
    const out = resolveSetInput({
      ...base,
      prescribed: false,
      suggestion: { reps: 9, weight: 80 },
      lastPerformance: { reps: 8, weight: 80 },
    });
    assert.deepEqual(out, { reps: 8, weight: 80 });
  });

  it('freestyle with no stored set does not take a program bump', () => {
    const out = resolveSetInput({
      ...base,
      prescribed: false,
      suggestion: { reps: 9, weight: 80 },
    });
    assert.deepEqual(out, { reps: 0, weight: 0 });
  });

  it('H-05: empty history does not invent a number', () => {
    const out = resolveSetInput({
      defaultReps: 10,
      defaultWeight: 0,
      prescribed: false,
    });
    assert.deepEqual(out, { reps: 0, weight: 0 });
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

  it('falls back through last performance to an empty row', () => {
    assert.deepEqual(
      resolveSetInput({ ...base, suggestion: null, lastPerformance: { reps: 7, weight: 75 } }),
      { reps: 7, weight: 75 }
    );
    assert.deepEqual(resolveSetInput({ ...base, suggestion: null, lastPerformance: null }), {
      reps: 0,
      weight: 0,
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

  it('skips warmup so the next work set does not inherit 40%', () => {
    const sets = [
      { completed: true, reps: 8, weight: 40, kind: 'warmup' },
      { completed: true, reps: 5, weight: 60, kind: 'warmup' },
      { completed: false, reps: 5, weight: 100, kind: 'normal' },
    ];
    assert.equal(priorCompletedInExercise(sets, 2), null);
  });

  it('carries the last working set across a warmup', () => {
    const sets = [
      { completed: true, reps: 5, weight: 100, kind: 'normal' },
      { completed: true, reps: 8, weight: 40, kind: 'warmup' },
      { completed: false, reps: 5, weight: 100, kind: 'normal' },
    ];
    assert.deepEqual(priorCompletedInExercise(sets, 2), { reps: 5, weight: 100 });
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

  it('prints BW + added load when plusLoad', () => {
    assert.equal(formatLoggedSetLine(8, 20, 'kg', 'BW', true), '8 × BW + 20 kg');
    assert.equal(formatLoggedSetLine(8, 0, 'kg', 'BW', true), '8 × BW');
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

  it('ActiveExerciseList uses garageSwapsWhenOpen rather than an open-idx ternary', () => {
    const list = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseList.tsx'),
      'utf8'
    );
    const page = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(list, /garageSwapsWhenOpen\(/);
    assert.match(page, /ActiveExerciseList/);
    assert.doesNotMatch(
      list,
      /rankSwapCandidates\(/,
      'list must call garageSwapsWhenOpen, not rankSwapCandidates directly'
    );
    assert.doesNotMatch(
      page,
      /garageSwapsWhenOpen\(/,
      'garage swap listing lives in ActiveExerciseList'
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
    assert.equal(view!.plusLoad, false);
    assert.deepEqual(view!.lastSetGhost, { reps: 8, weight: 80 });
  });

  it('plus-load last line is BW + belt, not a 20 kg bar', () => {
    const view = buildConsoleSet({
      exercises: [
        {
          exerciseId: 'pull-ups',
          sets: [{ reps: 8, weight: 0, completed: false, kind: 'normal' }],
        },
      ],
      nextSet: { exIdx: 0, setIdx: 0 },
      workoutHistory: historyWith('pull-ups', [{ reps: 8, weight: 20 }]),
      units: 'metric',
      goalId: 'hypertrophy',
      unitLabel: 'kg',
      bodyweightLabel: 'BW',
      resolveExerciseName: () => 'Pull-ups',
      resolvePlusLoad: () => true,
      resolveInput: (_e, _s, r, w) => ({ reps: r, weight: w }),
      translateReason: (key) => key,
    });
    assert.ok(view);
    assert.equal(view!.plusLoad, true);
    assert.equal(view!.overloadCue.lastLine, '8 × BW + 20 kg');
  });

  it('first-ever exercise has no last-set ghost', () => {
    const view = buildConsoleSet({
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [{ reps: 10, weight: 0, completed: false, kind: 'normal' }],
        },
      ],
      nextSet: { exIdx: 0, setIdx: 0 },
      workoutHistory: [],
      units: 'metric',
      goalId: 'general',
      unitLabel: 'kg',
      bodyweightLabel: 'BW',
      resolveExerciseName: () => 'Bench Press',
      resolveInput: (_e, _s, r, w) => ({ reps: r, weight: w }),
      translateReason: (_k, d) => d,
    });
    assert.ok(view);
    assert.equal(view!.lastSetGhost, null);
  });

  it('ghost is last working set, not warmup W', () => {
    const view = buildConsoleSet({
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [{ reps: 10, weight: 0, completed: false, kind: 'normal' }],
        },
      ],
      nextSet: { exIdx: 0, setIdx: 0 },
      workoutHistory: [
        {
          id: 'h1',
          workoutName: 'Past',
          startedAt: new Date(Date.now() - 86_400_000).toISOString(),
          completedAt: new Date(Date.now() - 86_400_000).toISOString(),
          durationSeconds: 3600,
          totalVolume: 400,
          exercises: [
            {
              exerciseId: 'bench-press',
              sets: [
                { reps: 10, weight: 40, kind: 'warmup' },
                { reps: 5, weight: 80, kind: 'normal' },
              ],
            },
          ],
        },
      ],
      units: 'metric',
      goalId: 'general',
      unitLabel: 'kg',
      bodyweightLabel: 'BW',
      resolveExerciseName: () => 'Bench Press',
      resolveInput: (_e, _s, r, w) => ({ reps: r, weight: w }),
      translateReason: (_k, d) => d,
    });
    assert.ok(view);
    assert.deepEqual(view!.lastSetGhost, { reps: 5, weight: 80 });
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

  it('a warmup set keeps the ramp weight, not last-session suggestion', () => {
    const out = resolveActiveSetDial({
      prescribed: false,
      defaultReps: 8,
      defaultWeight: 40,
      sets: [
        { completed: false, reps: 8, weight: 40, kind: 'warmup' },
        { completed: false, reps: 5, weight: 100, kind: 'normal' },
      ],
      setIdx: 0,
      lastSets: [{ reps: 5, weight: 100 }],
      units: 'metric',
      repMin: 8,
      repMax: 12,
      lastPerformance: { reps: 5, weight: 100 },
    });
    assert.deepEqual(out, { reps: 8, weight: 40 });
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

  it('set entry stays in the table — dock is rest only', () => {
    assert.equal(
      resolveActiveDockMode({ restTimerActive: false, hasConsoleSet: true, isCompact: true }),
      null
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
    assert.match(src, /ActiveSessionDock/);
    assert.doesNotMatch(
      src,
      /restTimerActive\s*\?\s*\([\s\S]*?consoleSet\s*&&\s*isCompact/,
      'dock mode decision must stay inside resolveActiveDockMode'
    );
    assert.doesNotMatch(
      src,
      /<RestTimerBar[\s\S]*?<LogConsole/,
      'rest/console chrome lives in ActiveSessionDock'
    );
  });

  it('ActiveSessionDock mounts RestTimerBar on rest and LogConsole on console', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveSessionDock.tsx'),
      'utf8'
    );
    assert.match(src, /dockMode === 'rest'/);
    assert.match(src, /<RestTimerBar/);
    assert.match(src, /dockMode === 'console'/);
    assert.match(src, /<LogConsole/);
    assert.match(src, /patchesForUseNext\(/);
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

  it('ActiveWorkoutPage uses composeFormGuideSheet rather than an inline IIFE', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /composeFormGuideSheet\(/);
    assert.doesNotMatch(
      src,
      /getFormGuideOrCues\(formGuideId/,
      'form guide lookup must stay inside composeFormGuideSheet'
    );
  });

  it('ActiveWorkoutPage mounts ActiveWorkoutSheets for overlay cluster (.450)', () => {
    const page = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    const sheets = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveWorkoutSheets.tsx'),
      'utf8'
    );
    assert.match(page, /ActiveWorkoutSheets/);
    assert.match(sheets, /SessionCheckInSheet/);
    assert.match(sheets, /FormGuideSheet/);
    assert.match(sheets, /AddExerciseSheet/);
    assert.match(sheets, /PlateCalculatorSheet/);
    assert.match(sheets, /WorkoutVictorySheet/);
    assert.doesNotMatch(
      page,
      /<FormGuideSheet/,
      'form guide sheet lives in ActiveWorkoutSheets'
    );
    assert.doesNotMatch(
      page,
      /<AddExerciseSheet/,
      'add exercise sheet lives in ActiveWorkoutSheets'
    );
    assert.doesNotMatch(
      page,
      /<PlateCalculatorSheet/,
      'plate calculator lives in ActiveWorkoutSheets'
    );
    assert.doesNotMatch(
      page,
      /<WorkoutVictorySheet/,
      'victory sheet lives in ActiveWorkoutSheets'
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

  it('volume-trim offer goes through planSessionCheckInDismiss (.406)', () => {
    const page = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    const checkIn = readFileSync(
      path.join(import.meta.dirname, 'activeSessionCheckIn.ts'),
      'utf8'
    );
    assert.match(page, /planSessionCheckInDismiss\(/);
    assert.doesNotMatch(
      page,
      /shouldOfferVolumeTrim\(/,
      'page must not call shouldOfferVolumeTrim — planSessionCheckInDismiss owns the offer'
    );
    assert.match(checkIn, /shouldOfferVolumeTrim\(/);
    assert.doesNotMatch(
      page,
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

  it('Victory deltas live in assembleActiveVictory via bodyScoreDeltas (.405)', () => {
    const page = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    const finish = readFileSync(
      path.join(import.meta.dirname, 'activeSessionFinish.ts'),
      'utf8'
    );
    assert.match(page, /assembleActiveVictory\(/);
    assert.doesNotMatch(
      page,
      /bodyScoreDeltas\(/,
      'page must not call bodyScoreDeltas — assembleActiveVictory owns Victory deltas'
    );
    assert.match(finish, /bodyScoreDeltas\(/);
    assert.doesNotMatch(
      finish,
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

  it('ActiveReadinessDeltaStrip uses shouldShowReadinessDelta rather than inlining null checks', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveReadinessDeltaStrip.tsx'),
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

describe('shouldShowVolumeTrimOffer', () => {
  it('requires both the check-in offer and a coach plan', () => {
    assert.equal(shouldShowVolumeTrimOffer(true, true), true);
    assert.equal(shouldShowVolumeTrimOffer(true, false), false);
    assert.equal(shouldShowVolumeTrimOffer(false, true), false);
  });

  it('ActiveReadinessDeltaStrip uses shouldShowVolumeTrimOffer rather than offer && plan', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveReadinessDeltaStrip.tsx'),
      'utf8'
    );
    assert.match(src, /shouldShowVolumeTrimOffer\(/);
    assert.doesNotMatch(
      src,
      /offerVolumeTrim\s*&&\s*plan/,
      'volume-trim CTA gate must stay inside shouldShowVolumeTrimOffer'
    );
  });
});

describe('resolveActiveGoalId', () => {
  const parse = (raw: string) => (raw.startsWith('goal:') ? raw.slice(5) : null);

  it('prefers primaryGoal, then goals, then general', () => {
    assert.equal(
      resolveActiveGoalId({
        primaryGoal: 'goal:strength',
        goals: 'goal:hypertrophy',
        parseGoalPresetId: parse,
      }),
      'strength'
    );
    assert.equal(
      resolveActiveGoalId({
        primaryGoal: null,
        goals: 'goal:hypertrophy',
        parseGoalPresetId: parse,
      }),
      'hypertrophy'
    );
    assert.equal(
      resolveActiveGoalId({
        primaryGoal: null,
        goals: null,
        parseGoalPresetId: parse,
      }),
      'general'
    );
  });

  it('ActiveWorkoutPage uses resolveActiveGoalId rather than inlining storage reads', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /resolveActiveGoalId\(/);
    assert.doesNotMatch(
      src,
      /parseGoalPresetId\(\s*readRaw\(STORAGE_KEYS\.primaryGoal\)/,
      'goal id resolution must stay inside resolveActiveGoalId'
    );
  });
});

describe('activeSessionHasExercises', () => {
  it('is false for empty or missing lists', () => {
    assert.equal(activeSessionHasExercises([]), false);
    assert.equal(activeSessionHasExercises(null), false);
    assert.equal(activeSessionHasExercises([{ id: 'x' }]), true);
  });

  it('ActiveWorkoutPage uses activeSessionHasExercises rather than length === 0', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /activeSessionHasExercises\(/);
    assert.doesNotMatch(src, /activeWorkout\.exercises\.length\s*===\s*0/);
  });
});

describe('activePostSessionPath', () => {
  it('maps today and history', () => {
    assert.equal(activePostSessionPath('today'), '/log');
    assert.equal(activePostSessionPath('history'), '/history');
  });

  it('ActiveWorkoutPage uses activePostSessionPath for Victory/discard navigation', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /activePostSessionPath\(/);
    assert.doesNotMatch(src, /router\.push\(['"]\/log['"]\)/);
    assert.doesNotMatch(src, /router\.push\(['"]\/history['"]\)/);
  });
});

describe('sessionSetsProgressPct', () => {
  it('returns 0 for empty sessions and rounds the ratio', () => {
    assert.equal(sessionSetsProgressPct(0, 0), 0);
    assert.equal(sessionSetsProgressPct(1, 3), 33);
    assert.equal(sessionSetsProgressPct(3, 3), 100);
  });
});

describe('activeCoachTipKind', () => {
  it('bands hard-set count into high vs default', () => {
    assert.equal(activeCoachTipKind(0), 'default');
    assert.equal(activeCoachTipKind(2), 'default');
    assert.equal(activeCoachTipKind(3), 'high');
    assert.equal(activeCoachTipKind(2, 1), 'high');
  });

  it('ActiveSessionChrome uses activeCoachTipKind rather than an inline hardCount threshold', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveSessionChrome.tsx'),
      'utf8'
    );
    assert.match(src, /activeCoachTipKind\(/);
    assert.doesNotMatch(
      src,
      /hardCount\s*>\s*2/,
      'hard-set tip threshold must stay inside activeCoachTipKind'
    );
  });
});

describe('toggleOpenIdx', () => {
  it('opens when closed or on another row, closes when already open', () => {
    assert.equal(toggleOpenIdx(null, 1), 1);
    assert.equal(toggleOpenIdx(0, 1), 1);
    assert.equal(toggleOpenIdx(1, 1), null);
  });

  it('ActiveWorkoutPage uses toggleOpenIdx for note and swap toggles', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /toggleOpenIdx\(/);
    assert.doesNotMatch(
      src,
      /setNoteOpenIdx\(noteOpenIdx\s*===\s*exIdx\s*\?\s*null\s*:\s*exIdx\)/,
      'note accordion toggle must stay inside toggleOpenIdx'
    );
    assert.doesNotMatch(
      src,
      /setSwapOpenIdx\(swapOpenIdx\s*===\s*exIdx\s*\?\s*null\s*:\s*exIdx\)/,
      'swap accordion toggle must stay inside toggleOpenIdx'
    );
  });
});

describe('isOpenIdx', () => {
  it('matches the open row only', () => {
    assert.equal(isOpenIdx(null, 0), false);
    assert.equal(isOpenIdx(1, 1), true);
    assert.equal(isOpenIdx(1, 0), false);
  });

  it('ActiveExerciseList uses isOpenIdx for note/swap open props', () => {
    const list = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseList.tsx'),
      'utf8'
    );
    const page = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(list, /isOpenIdx\(/);
    assert.match(page, /ActiveExerciseList/);
    assert.doesNotMatch(
      list,
      /swapOpen=\{swapOpenIdx\s*===\s*exIdx\}/,
      'swap open prop must stay inside isOpenIdx'
    );
    assert.doesNotMatch(
      list,
      /noteOpen=\{noteOpenIdx\s*===\s*exIdx\}/,
      'note open prop must stay inside isOpenIdx'
    );
  });
});

describe('laterLiftVisible', () => {
  const squat = { sets: [{ completed: false }, { completed: false }] };
  const push = { sets: [{ completed: false }] };
  const plank = { sets: [{ completed: false }] };

  it('hides later lifts until the first set of the session is logged', () => {
    assert.equal(laterLiftVisible([squat, push, plank], 0), true);
    assert.equal(laterLiftVisible([squat, push, plank], 1), false);
    assert.equal(laterLiftVisible([squat, push, plank], 2), false);
  });

  it('ActiveExerciseList withholds later lifts through laterLiftVisible', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseList.tsx'),
      'utf8'
    );
    assert.match(src, /laterLiftVisible\(/);
  });

  it('shows every lift after any set is logged', () => {
    const after = [{ sets: [{ completed: true }, { completed: false }] }, push, plank];
    assert.equal(laterLiftVisible(after, 0), true);
    assert.equal(laterLiftVisible(after, 1), true);
    assert.equal(laterLiftVisible(after, 2), true);
  });
});

describe('exerciseHasCompletedSet', () => {
  it('is true when any set is completed', () => {
    assert.equal(exerciseHasCompletedSet([]), false);
    assert.equal(exerciseHasCompletedSet([{ completed: false }]), false);
    assert.equal(exerciseHasCompletedSet([{ completed: true }, { completed: false }]), true);
  });

  it('ActiveExerciseCard uses exerciseHasCompletedSet rather than sets.some', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseCard.tsx'),
      'utf8'
    );
    assert.match(src, /exerciseHasCompletedSet\(/);
    assert.doesNotMatch(
      src,
      /exLog\.sets\.some\(\(s\)\s*=>\s*s\.completed\)/,
      'completed-set predicate must stay inside exerciseHasCompletedSet'
    );
  });
});

describe('exerciseHasPlannedSet', () => {
  it('is true when any set is still open', () => {
    assert.equal(exerciseHasPlannedSet([]), false);
    assert.equal(exerciseHasPlannedSet([{ completed: true }]), false);
    assert.equal(exerciseHasPlannedSet([{ completed: true }, { completed: false }]), true);
  });

  it('ActiveExerciseCard uses exerciseHasPlannedSet rather than sets.some', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseCard.tsx'),
      'utf8'
    );
    assert.match(src, /exerciseHasPlannedSet\(/);
    assert.doesNotMatch(
      src,
      /exLog\.sets\.some\(\(s\)\s*=>\s*!s\.completed\)/,
      'planned-set predicate must stay inside exerciseHasPlannedSet'
    );
  });
});

describe('firstPlannedSetIdx', () => {
  it('returns the first incomplete index or -1', () => {
    assert.equal(firstPlannedSetIdx([]), -1);
    assert.equal(firstPlannedSetIdx([{ completed: true }]), -1);
    assert.equal(firstPlannedSetIdx([{ completed: true }, { completed: false }]), 1);
  });

  it('resolveExerciseNextTarget owns firstPlannedSetIdx; the card does not re-find', () => {
    const helpers = readFileSync(
      path.join(import.meta.dirname, 'activeWorkoutHelpers.ts'),
      'utf8'
    );
    const card = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseCard.tsx'),
      'utf8'
    );
    assert.match(helpers, /firstPlannedSetIdx\(params\.sets\)/);
    assert.match(card, /resolveExerciseNextTarget\(/);
    assert.doesNotMatch(
      card,
      /exLog\.sets\.findIndex\(\(s\)\s*=>\s*!s\.completed\)/,
      'first planned index must stay inside firstPlannedSetIdx / resolveExerciseNextTarget'
    );
  });
});

describe('holdsActiveExercise', () => {
  it('matches the next-set exercise index', () => {
    assert.equal(holdsActiveExercise(null, 0), false);
    assert.equal(holdsActiveExercise({ exIdx: 1 }, 1), true);
    assert.equal(holdsActiveExercise({ exIdx: 1 }, 0), false);
  });

  it('ActiveExerciseCard uses holdsActiveExercise rather than nextSet?.exIdx ===', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseCard.tsx'),
      'utf8'
    );
    assert.match(src, /holdsActiveExercise\(/);
    assert.doesNotMatch(
      src,
      /const holdsActiveSet = nextSet\?\.exIdx\s*===\s*exIdx/,
      'active-exercise ownership must stay inside holdsActiveExercise'
    );
  });
});

describe('isActiveSetCell', () => {
  it('matches the next-set cell', () => {
    assert.equal(isActiveSetCell(null, 0, 0), false);
    assert.equal(isActiveSetCell({ exIdx: 1, setIdx: 2 }, 1, 2), true);
    assert.equal(isActiveSetCell({ exIdx: 1, setIdx: 2 }, 1, 0), false);
  });

  it('ActiveExerciseCard uses activeSetIdxForExercise rather than an inline pair compare', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseCard.tsx'),
      'utf8'
    );
    assert.match(src, /activeSetIdxForExercise\(/);
    assert.doesNotMatch(
      src,
      /nextSet\?\.exIdx\s*===\s*exIdx\s*&&\s*nextSet\?\.setIdx\s*===\s*setIdx/,
      'active set index must stay inside activeSetIdxForExercise'
    );
  });
});

describe('activeSetIdxForExercise', () => {
  it('returns setIdx for the owning exercise else -1', () => {
    assert.equal(activeSetIdxForExercise(null, 0), -1);
    assert.equal(activeSetIdxForExercise({ exIdx: 1, setIdx: 2 }, 1), 2);
    assert.equal(activeSetIdxForExercise({ exIdx: 1, setIdx: 2 }, 0), -1);
  });

  it('ActiveExerciseCard uses activeSetIdxForExercise for desktop table', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseCard.tsx'),
      'utf8'
    );
    assert.match(src, /activeSetIdxForExercise\(/);
    assert.doesNotMatch(
      src,
      /activeSetIdx=\{nextSet\?\.exIdx\s*===\s*exIdx\s*\?\s*nextSet\.setIdx\s*:\s*-1\}/,
      'desktop activeSetIdx must stay inside activeSetIdxForExercise'
    );
  });
});

describe('shouldShowSetOptionsFooter', () => {
  it('shows when history exists or more than one planned set', () => {
    assert.equal(
      shouldShowSetOptionsFooter({ hasLastSets: true, hasPlanned: true, plannedSetCount: 1 }),
      true
    );
    assert.equal(
      shouldShowSetOptionsFooter({ hasLastSets: false, hasPlanned: true, plannedSetCount: 2 }),
      true
    );
    assert.equal(
      shouldShowSetOptionsFooter({ hasLastSets: false, hasPlanned: true, plannedSetCount: 1 }),
      false
    );
  });

  it('ActiveExerciseFooter uses shouldShowSetOptionsFooter rather than an inline or', () => {
    const footer = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseFooter.tsx'),
      'utf8'
    );
    const card = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseCard.tsx'),
      'utf8'
    );
    assert.match(footer, /shouldShowSetOptionsFooter\(/);
    assert.match(card, /ActiveExerciseFooter/);
    assert.doesNotMatch(
      card,
      /shouldShowSetOptionsFooter\(/,
      'set options footer gate lives in ActiveExerciseFooter'
    );
  });
});

describe('shouldShowApplyTargetsMenuitem / shouldShowRemoveSetMenuitem', () => {
  it('gates Apply targets and Remove set independently', () => {
    assert.equal(shouldShowApplyTargetsMenuitem(true, true), true);
    assert.equal(shouldShowApplyTargetsMenuitem(false, true), false);
    assert.equal(shouldShowRemoveSetMenuitem(true, 2), true);
    assert.equal(shouldShowRemoveSetMenuitem(true, 1), false);
  });

  it('ActiveExerciseCard uses the menuitem helpers rather than inline ands', () => {
    const more = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseMoreMenu.tsx'),
      'utf8'
    );
    const opts = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveSetOptionsMenu.tsx'),
      'utf8'
    );
    const card = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseCard.tsx'),
      'utf8'
    );
    const header = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseHeader.tsx'),
      'utf8'
    );
    const footer = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseFooter.tsx'),
      'utf8'
    );
    assert.match(more, /shouldShowSupersetLinkMenuitem\(/);
    assert.match(more, /shouldShowExerciseSwapMenuitem\(/);
    assert.match(opts, /shouldShowApplyTargetsMenuitem\(/);
    assert.match(opts, /shouldShowRemoveSetMenuitem\(/);
    assert.match(card, /ActiveExerciseHeader/);
    assert.match(card, /ActiveExerciseFooter/);
    assert.match(header, /ActiveExerciseMoreMenu/);
    assert.match(footer, /ActiveSetOptionsMenu/);
    assert.doesNotMatch(
      card,
      /ActiveSetOptionsMenu/,
      'Set options menu mounts from ActiveExerciseFooter'
    );
    assert.doesNotMatch(
      card,
      /ActiveExerciseMoreMenu/,
      'More menu mounts from ActiveExerciseHeader'
    );
    assert.doesNotMatch(
      card,
      /shouldShowApplyTargetsMenuitem\(/,
      'Apply targets menuitem lives in ActiveSetOptionsMenu'
    );
  });
});

describe('exerciseHasWeightedSet / firstWeightedLoad', () => {
  it('finds the first positive weight', () => {
    assert.equal(exerciseHasWeightedSet([{ weight: 0 }]), false);
    assert.equal(exerciseHasWeightedSet([{ weight: 0 }, { weight: 60 }]), true);
    assert.equal(firstWeightedLoad([{ weight: 0 }, { weight: 60 }]), 60);
    assert.equal(firstWeightedLoad([{ weight: 0 }]), 0);
  });

  it('ActiveExerciseHeader uses weighted-set helpers for the load chip', () => {
    const header = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseHeader.tsx'),
      'utf8'
    );
    const card = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseCard.tsx'),
      'utf8'
    );
    assert.match(header, /shouldShowLoadPctChip\(/);
    assert.match(header, /firstWeightedLoad\(/);
    assert.match(card, /ActiveExerciseHeader/);
    assert.doesNotMatch(
      header,
      /exLog\.sets\.some\(\(s\)\s*=>\s*s\.weight\s*>\s*0\)/,
      'weighted-set gate must stay inside exerciseHasWeightedSet / shouldShowLoadPctChip'
    );
    assert.doesNotMatch(
      header,
      /exLog\.loadPct\s*!=\s*null\s*&&\s*\n?\s*exLog\.loadPct\s*>\s*0/,
      'loadPct chip gate must stay inside shouldShowLoadPctChip'
    );
  });
});

describe('resolveExerciseNextTarget / menu visibility', () => {
  const planned = [
    { reps: 5, weight: 100, completed: false },
    { reps: 5, weight: 100, completed: false },
  ];

  it('prescribed echoes the plan set, never a freestyle suggestion', () => {
    let suggestCalls = 0;
    const out = resolveExerciseNextTarget({
      sets: planned,
      prescribed: true,
      lastSets: [{ reps: 8, weight: 90 }],
      units: 'metric',
      suggest: () => {
        suggestCalls += 1;
        return { reps: 99, weight: 99, reason: 'from_last', evidenceWorkingIdx: [] };
      },
    });
    assert.deepEqual(out, { reps: 5, weight: 100 });
    assert.equal(suggestCalls, 0);
  });

  it('freestyle uses last-session suggestion when incomplete sets remain', () => {
    const out = resolveExerciseNextTarget({
      sets: planned,
      prescribed: false,
      lastSets: [{ reps: 8, weight: 90 }],
      units: 'metric',
      suggest: () => ({ reps: 8, weight: 92.5, reason: 'add_weight', evidenceWorkingIdx: [] }),
    });
    assert.deepEqual(out, {
      reps: 8,
      weight: 92.5,
      reason: 'add_weight',
      evidenceWorkingIdx: [],
    });
  });

  it('returns null when every set is done or there is no last session', () => {
    assert.equal(
      resolveExerciseNextTarget({
        sets: [{ reps: 5, weight: 100, completed: true }],
        prescribed: false,
        lastSets: [{ reps: 5, weight: 100 }],
        units: 'metric',
      }),
      null
    );
    assert.equal(
      resolveExerciseNextTarget({
        sets: planned,
        prescribed: false,
        lastSets: null,
        units: 'metric',
      }),
      null
    );
  });

  it('loadPct chip and menu gates are boolean predicates', () => {
    assert.equal(shouldShowLoadPctChip(70, [{ weight: 60 }]), true);
    assert.equal(shouldShowLoadPctChip(70, [{ weight: 0 }]), false);
    assert.equal(shouldShowLoadPctChip(null, [{ weight: 60 }]), false);
    assert.equal(shouldShowSupersetLinkMenuitem(true, false), true);
    assert.equal(shouldShowSupersetLinkMenuitem(true, true), false);
    assert.equal(shouldShowExerciseSwapMenuitem(false, 2), true);
    assert.equal(shouldShowExerciseSwapMenuitem(false, 0), true);
    assert.equal(shouldShowExerciseSwapMenuitem(true, 2), false);
    assert.equal(shouldShowExerciseSwapMenuitem(false, 2, true), false);
  });

  it('ActiveExerciseCard wires the next-target and header/footer', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseCard.tsx'),
      'utf8'
    );
    const more = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseMoreMenu.tsx'),
      'utf8'
    );
    const header = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'ActiveExerciseHeader.tsx'),
      'utf8'
    );
    assert.match(src, /resolveExerciseNextTarget\(/);
    assert.match(src, /ActiveExerciseHeader/);
    assert.match(src, /ActiveExerciseFooter/);
    assert.match(header, /ActiveExerciseMoreMenu/);
    assert.match(more, /shouldShowSupersetLinkMenuitem\(/);
    assert.match(more, /shouldShowExerciseSwapMenuitem\(/);
    assert.doesNotMatch(
      src,
      /suggestNextSetTarget\(/,
      'freestyle suggestion must stay inside resolveExerciseNextTarget'
    );
  });
});
