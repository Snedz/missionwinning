import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { CompletedWorkoutLog, SetKind } from '@/types';
import {
  formatSignedDelta,
  formatVsLastDelta,
  formatVsLastSetDeltas,
  vsLastDeltaForSet,
  workingSetIndex,
} from './vsLastSet.ts';

const WORDS = { same: 'same', rep: 'rep', reps: 'reps' };

function historyWith(
  exerciseId: string,
  sets: { reps: number; weight: number; kind?: SetKind }[]
): CompletedWorkoutLog[] {
  return [
    {
      id: 'h1',
      workoutName: 'Past',
      startedAt: 't0',
      completedAt: 't1',
      durationSeconds: 3600,
      totalVolume: 100,
      exercises: [
        {
          exerciseId,
          sets: sets.map((s) => ({ reps: s.reps, weight: s.weight, kind: s.kind })),
        },
      ],
    },
  ];
}

describe('workingSetIndex', () => {
  it('skips warmups when counting the working slot', () => {
    const sets = [
      { kind: 'warmup' as const },
      { kind: 'warmup' as const },
      { kind: 'normal' as const },
      { kind: 'normal' as const },
    ];
    assert.equal(workingSetIndex(sets, 0), null);
    assert.equal(workingSetIndex(sets, 1), null);
    assert.equal(workingSetIndex(sets, 2), 0);
    assert.equal(workingSetIndex(sets, 3), 1);
  });
});

describe('vsLastDeltaForSet', () => {
  it('+weight when load rose', () => {
    assert.deepEqual(
      vsLastDeltaForSet({ completed: true, reps: 5, weight: 102.5, kind: 'normal' }, {
        reps: 5,
        weight: 100,
      }),
      { kind: 'weight', signed: 2.5 }
    );
  });

  it('+reps when load is unchanged', () => {
    assert.deepEqual(
      vsLastDeltaForSet({ completed: true, reps: 6, weight: 100, kind: 'normal' }, {
        reps: 5,
        weight: 100,
      }),
      { kind: 'reps', signed: 1 }
    );
  });

  it('first-ever (no last match) is none', () => {
    assert.deepEqual(
      vsLastDeltaForSet({ completed: true, reps: 5, weight: 100, kind: 'normal' }, null),
      { kind: 'none' }
    );
  });

  it('warmup current is none even with a last set', () => {
    assert.deepEqual(
      vsLastDeltaForSet({ completed: true, reps: 10, weight: 40, kind: 'warmup' }, {
        reps: 10,
        weight: 40,
      }),
      { kind: 'none' }
    );
  });

  it('incomplete current is none', () => {
    assert.deepEqual(
      vsLastDeltaForSet({ completed: false, reps: 5, weight: 102.5, kind: 'normal' }, {
        reps: 5,
        weight: 100,
      }),
      { kind: 'none' }
    );
  });

  it('same when both match', () => {
    assert.deepEqual(
      vsLastDeltaForSet({ completed: true, reps: 5, weight: 100, kind: 'normal' }, {
        reps: 5,
        weight: 100,
      }),
      { kind: 'same' }
    );
  });

  it('weight wins when both load and reps changed', () => {
    assert.deepEqual(
      vsLastDeltaForSet({ completed: true, reps: 6, weight: 102.5, kind: 'normal' }, {
        reps: 5,
        weight: 100,
      }),
      { kind: 'weight', signed: 2.5 }
    );
  });

  it('bodyweight compares reps only', () => {
    assert.deepEqual(
      vsLastDeltaForSet({ completed: true, reps: 12, weight: 0, kind: 'normal' }, {
        reps: 10,
        weight: 0,
      }),
      { kind: 'reps', signed: 2 }
    );
  });
});

describe('formatVsLastDelta', () => {
  it('formats +weight / +reps / same / first-ever', () => {
    assert.equal(
      formatVsLastDelta({ kind: 'weight', signed: 2.5 }, 'kg', WORDS),
      '+2.5 kg'
    );
    assert.equal(
      formatVsLastDelta({ kind: 'reps', signed: 1 }, 'kg', WORDS),
      '+1 rep'
    );
    assert.equal(formatVsLastDelta({ kind: 'same' }, 'kg', WORDS), 'same');
    assert.equal(formatVsLastDelta({ kind: 'none' }, 'kg', WORDS), null);
    assert.equal(formatSignedDelta(-2.5), '-2.5');
    assert.equal(
      formatVsLastDelta({ kind: 'reps', signed: 2 }, 'kg', WORDS),
      '+2 reps'
    );
  });
});

describe('formatVsLastSetDeltas', () => {
  it('+weight on the matching working set', () => {
    const hist = historyWith('bench-press', [{ reps: 5, weight: 100, kind: 'normal' }]);
    const labels = formatVsLastSetDeltas(
      hist,
      'bench-press',
      [{ completed: true, reps: 5, weight: 102.5, kind: 'normal' }],
      'kg',
      WORDS
    );
    assert.deepEqual(labels, ['+2.5 kg']);
  });

  it('+reps when load matches', () => {
    const hist = historyWith('bench-press', [{ reps: 5, weight: 100, kind: 'normal' }]);
    const labels = formatVsLastSetDeltas(
      hist,
      'bench-press',
      [{ completed: true, reps: 6, weight: 100, kind: 'normal' }],
      'kg',
      WORDS
    );
    assert.deepEqual(labels, ['+1 rep']);
  });

  it('first-ever has no token', () => {
    const labels = formatVsLastSetDeltas(
      [],
      'bench-press',
      [{ completed: true, reps: 5, weight: 100, kind: 'normal' }],
      'kg',
      WORDS
    );
    assert.deepEqual(labels, [null]);
  });

  it('last-session warmup does not steal working index 0', () => {
    const hist = historyWith('squats', [
      { reps: 10, weight: 40, kind: 'warmup' },
      { reps: 5, weight: 100, kind: 'normal' },
    ]);
    const labels = formatVsLastSetDeltas(
      hist,
      'squats',
      [
        { completed: true, reps: 10, weight: 40, kind: 'warmup' },
        { completed: true, reps: 5, weight: 102.5, kind: 'normal' },
      ],
      'kg',
      WORDS
    );
    assert.deepEqual(labels, [null, '+2.5 kg']);
  });

  it('extra working set with no last match is first-ever for that slot', () => {
    const hist = historyWith('bench-press', [{ reps: 5, weight: 100, kind: 'normal' }]);
    const labels = formatVsLastSetDeltas(
      hist,
      'bench-press',
      [
        { completed: true, reps: 5, weight: 100, kind: 'normal' },
        { completed: true, reps: 5, weight: 100, kind: 'normal' },
      ],
      'kg',
      WORDS
    );
    assert.deepEqual(labels, ['same', null]);
  });
});

describe('vs-last stays off the ghost / social lanes', () => {
  const root = path.join(import.meta.dirname, '..', '..', '..');
  const read = (...parts: string[]) => readFileSync(path.join(root, ...parts), 'utf8');

  it('does not import ghost prefill helpers or social rank', () => {
    const raw = read('src', 'lib', 'workout', 'vsLastSet.ts');
    const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.doesNotMatch(src, /getLastPerformanceForSet|formatPrevSetLabels|resolveSetInput/);
    assert.doesNotMatch(src, /leaderboard|elite|rankAgainst|other users/i);
    assert.match(src, /getLastSessionSets/);
    assert.match(src, /workingSets/);
  });

  it('SetLogRow and SetLogTable paint the token; card wires labels', () => {
    const row = read('src', 'components', 'workout', 'SetLogRow.tsx');
    const table = read('src', 'components', 'workout', 'SetLogTable.tsx');
    const card = read('src', 'components', 'workout', 'ActiveExerciseCard.tsx');
    assert.match(row, /set-row-vs-last/);
    assert.match(table, /set-table-vs-last/);
    assert.match(card, /formatVsLastSetDeltas/);
    assert.match(card, /vsLastLabel=\{vsLastLabels\[setIdx\]\}/);
    assert.match(card, /vsLastLabels=\{vsLastLabels\}/);
    assert.doesNotMatch(row, /elite/i);
    assert.doesNotMatch(table, /elite/i);
  });
});
