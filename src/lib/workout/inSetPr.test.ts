/**
 * In-set PR they actually hit. No prior → nothing. Not Epley.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog, SetKind } from '@/types';
import {
  collectDiaryWorkingSets,
  decideInSetPr,
  formatInSetPrLabel,
  formatInSetPrLabels,
} from './inSetPr.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (...parts: string[]) => readFileSync(path.join(root, ...parts), 'utf8');

const WORDS = {
  heaviest: 'Heaviest',
  mostReps: 'Most reps',
  bestLogged5: 'Best logged 5',
};

function historyWith(
  exerciseId: string,
  sets: { reps: number; weight: number; kind?: SetKind; durationSeconds?: number }[],
  over: Partial<CompletedWorkoutLog> = {}
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
          sets: sets.map((s) => ({
            reps: s.reps,
            weight: s.weight,
            kind: s.kind,
            ...(s.durationSeconds != null ? { durationSeconds: s.durationSeconds } : {}),
          })),
        },
      ],
      ...over,
    },
  ];
}

function decide(
  just: { reps: number; weight: number; kind?: string; durationSeconds?: number },
  history: CompletedWorkoutLog[],
  over: {
    exerciseId?: string;
    rowType?: 'weight' | 'bodyweight' | 'duration' | 'assisted';
    sessionPriors?: { reps: number; weight: number; kind?: string; completed?: boolean }[];
  } = {}
) {
  return decideInSetPr({
    exerciseId: over.exerciseId ?? 'bench-press',
    justLogged: just,
    rowType: over.rowType ?? 'weight',
    history,
    sessionPriors: over.sessionPriors,
  });
}

describe('decideInSetPr honesty', () => {
  it('empty / first-ever invents nothing', () => {
    assert.deepEqual(decide({ reps: 5, weight: 100 }, []).kinds, []);
    assert.deepEqual(
      decide({ reps: 5, weight: 100 }, historyWith('squat', [{ reps: 5, weight: 140 }])).kinds,
      []
    );
  });

  it('warmup / drop / empty never count as a PR', () => {
    const history = historyWith('bench-press', [{ reps: 5, weight: 100 }]);
    assert.deepEqual(decide({ reps: 5, weight: 140, kind: 'warmup' }, history).kinds, []);
    assert.deepEqual(decide({ reps: 8, weight: 80, kind: 'drop' }, history).kinds, []);
    assert.deepEqual(decide({ reps: 0, weight: 140 }, history).kinds, []);
  });

  it('warmup / drop in the diary are not a prior', () => {
    const history = historyWith('bench-press', [
      { reps: 8, weight: 60, kind: 'warmup' },
      { reps: 8, weight: 80, kind: 'drop' },
    ]);
    assert.deepEqual(decide({ reps: 5, weight: 100 }, history).kinds, []);
    assert.deepEqual(collectDiaryWorkingSets(history, 'bench-press'), []);
  });

  it('tombstone diary is not a prior', () => {
    const history = historyWith(
      'bench-press',
      [{ reps: 5, weight: 100 }],
      { deletedAt: 't2' }
    );
    assert.deepEqual(decide({ reps: 5, weight: 120 }, history).kinds, []);
  });

  it('first session of this lift invents nothing even on a later set', () => {
    assert.deepEqual(
      decide(
        { reps: 5, weight: 110 },
        [],
        { sessionPriors: [{ reps: 5, weight: 100, completed: true }] }
      ).kinds,
      []
    );
  });
});

describe('decideInSetPr kinds they can hit', () => {
  it('heaviest when the working set beats diary max load', () => {
    const history = historyWith('bench-press', [
      { reps: 5, weight: 100 },
      { reps: 5, weight: 102.5 },
    ]);
    assert.deepEqual(decide({ reps: 3, weight: 110 }, history).kinds, ['heaviest']);
    assert.deepEqual(decide({ reps: 3, weight: 102.5 }, history).kinds, []);
    assert.deepEqual(decide({ reps: 3, weight: 102.4 }, history).kinds, []);
  });

  it('most reps at that load', () => {
    const history = historyWith('bench-press', [
      { reps: 5, weight: 100 },
      { reps: 6, weight: 90 },
    ]);
    assert.deepEqual(decide({ reps: 6, weight: 100 }, history).kinds, ['most_reps']);
    assert.deepEqual(decide({ reps: 5, weight: 100 }, history).kinds, []);
    assert.deepEqual(decide({ reps: 7, weight: 90 }, history).kinds, ['most_reps']);
  });

  it('best logged 5 is a real 5 they wrote, not an estimated 5RM', () => {
    const history = historyWith('bench-press', [
      { reps: 5, weight: 100 },
      { reps: 8, weight: 90 },
    ]);
    assert.deepEqual(decide({ reps: 5, weight: 105 }, history).kinds, [
      'heaviest',
      'best_logged_5',
    ]);
    assert.deepEqual(decide({ reps: 5, weight: 100 }, history).kinds, []);
    assert.deepEqual(decide({ reps: 4, weight: 105 }, history).kinds, ['heaviest']);
  });

  it('does not mint best logged 5 without a prior 5', () => {
    const history = historyWith('bench-press', [{ reps: 8, weight: 100 }]);
    assert.deepEqual(decide({ reps: 5, weight: 90 }, history).kinds, []);
    assert.deepEqual(decide({ reps: 5, weight: 110 }, history).kinds, ['heaviest']);
  });

  it('same-session later set uses earlier work so a lighter follow-up is not heaviest', () => {
    const history = historyWith('bench-press', [{ reps: 5, weight: 100 }]);
    assert.deepEqual(
      decide(
        { reps: 3, weight: 105 },
        history,
        { sessionPriors: [{ reps: 3, weight: 110, completed: true }] }
      ).kinds,
      []
    );
    assert.deepEqual(
      decide(
        { reps: 3, weight: 115 },
        history,
        { sessionPriors: [{ reps: 3, weight: 110, completed: true }] }
      ).kinds,
      ['heaviest']
    );
  });

  it('bodyweight most reps is type-honest; vest is extra only', () => {
    const history = historyWith('pull-up', [{ reps: 8, weight: 0 }]);
    assert.deepEqual(
      decide({ reps: 10, weight: 0 }, history, {
        exerciseId: 'pull-up',
        rowType: 'bodyweight',
      }).kinds,
      ['most_reps']
    );
    assert.deepEqual(
      decide({ reps: 8, weight: 0 }, history, {
        exerciseId: 'pull-up',
        rowType: 'bodyweight',
      }).kinds,
      []
    );
    assert.deepEqual(
      decide({ reps: 6, weight: 10 }, history, {
        exerciseId: 'pull-up',
        rowType: 'bodyweight',
      }).kinds,
      ['heaviest']
    );
  });

  it('duration most reps is a longer hold; heaviest and best-5 stay empty', () => {
    const history = historyWith('plank', [
      { reps: 0, weight: 0, durationSeconds: 45 },
    ]);
    assert.deepEqual(
      decide(
        { reps: 0, weight: 0, durationSeconds: 60 },
        history,
        { exerciseId: 'plank', rowType: 'duration' }
      ).kinds,
      ['most_reps']
    );
    assert.deepEqual(
      decide(
        { reps: 0, weight: 0, durationSeconds: 45 },
        history,
        { exerciseId: 'plank', rowType: 'duration' }
      ).kinds,
      []
    );
  });

  it('assisted is most reps at that help — not a heaviest invent', () => {
    const history = historyWith('assisted-dip', [{ reps: 6, weight: 20 }]);
    assert.deepEqual(
      decide({ reps: 8, weight: 20 }, history, {
        exerciseId: 'assisted-dip',
        rowType: 'assisted',
      }).kinds,
      ['most_reps']
    );
    assert.deepEqual(
      decide({ reps: 6, weight: 10 }, history, {
        exerciseId: 'assisted-dip',
        rowType: 'assisted',
      }).kinds,
      []
    );
  });
});

describe('formatInSetPrLabels', () => {
  it('paints the quiet kinds; first-ever slots stay null', () => {
    const history = historyWith('bench-press', [{ reps: 5, weight: 100 }]);
    const labels = formatInSetPrLabels(
      history,
      'bench-press',
      [
        { reps: 5, weight: 100, completed: true },
        { reps: 5, weight: 110, completed: true },
        { reps: 5, weight: 110, completed: false },
      ],
      'weight',
      WORDS
    );
    assert.deepEqual(labels, [null, 'Heaviest · Best logged 5', null]);
  });

  it('joins kinds they actually hit', () => {
    assert.equal(formatInSetPrLabel([], WORDS), null);
    assert.equal(formatInSetPrLabel(['most_reps'], WORDS), 'Most reps');
    assert.equal(
      formatInSetPrLabel(['heaviest', 'best_logged_5'], WORDS),
      'Heaviest · Best logged 5'
    );
  });
});

describe('inSetPr helper lock', () => {
  it('stays a pure diary compare — no Epley, store, premium, or social', () => {
    const src = read('src', 'lib', 'workout', 'inSetPr.ts');
    assert.match(src, /export function decideInSetPr/);
    assert.match(src, /setRowHasWork/);
    assert.doesNotMatch(src, /estimateOneRepMax|epley1rm|epleySessionEstimate/);
    assert.doesNotMatch(src, /from\s+['"]@\/store\//);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/rewards/);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/premium/);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/bodyMetrics/);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/speech/);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/wearables/);
    assert.doesNotMatch(src, /isPremium|UnlockButton|\/bundle/);
    assert.doesNotMatch(src, /discord\.com|WeChat|four-scene/);
  });
});
