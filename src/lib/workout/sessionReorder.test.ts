/**
 * Live-session reorder moves a card. Empty / same / OOB invents nothing.
 * Does not rewrite Wednesday / saved / plan. Sets travel with the card.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { ActiveExerciseLog } from '@/types';
import { reorderSessionExercises } from './sessionReorder.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function card(
  exerciseId: string,
  over: Partial<ActiveExerciseLog> = {}
): ActiveExerciseLog {
  return {
    exerciseId,
    sets: [
      { id: `${exerciseId}-1`, reps: 8, weight: 40, completed: false },
      { id: `${exerciseId}-2`, reps: 8, weight: 40, completed: false },
    ],
    ...over,
  };
}

describe('reorderSessionExercises', () => {
  it('moves the first card to the end', () => {
    const session = [card('bench-press'), card('squat'), card('cable-row')];
    const next = reorderSessionExercises(session, 0, 2);
    assert.ok(next);
    assert.deepEqual(
      next.map((ex) => ex.exerciseId),
      ['squat', 'cable-row', 'bench-press']
    );
  });

  it('moves the last card to the front', () => {
    const session = [card('bench-press'), card('squat'), card('cable-row')];
    const next = reorderSessionExercises(session, 2, 0);
    assert.ok(next);
    assert.deepEqual(
      next.map((ex) => ex.exerciseId),
      ['cable-row', 'bench-press', 'squat']
    );
  });

  it('empty / same / OOB / non-integer invents nothing', () => {
    const session = [card('bench-press'), card('squat')];
    assert.equal(reorderSessionExercises([], 0, 1), null);
    assert.equal(reorderSessionExercises(session, 0, 0), null);
    assert.equal(reorderSessionExercises(session, -1, 0), null);
    assert.equal(reorderSessionExercises(session, 0, 3), null);
    assert.equal(reorderSessionExercises(session, 1.5, 0), null);
    assert.equal(reorderSessionExercises(session, 0, 0.5), null);
  });

  it('sets and skip mark travel with the card — reorder is not a swap', () => {
    const logged = card('bench-press', {
      sets: [
        { id: 'a', reps: 5, weight: 100, completed: true },
        { id: 'b', reps: 5, weight: 100, completed: false },
      ],
      skippedThisSession: true,
      note: 'left shoulder felt off',
    });
    const next = reorderSessionExercises([logged, card('squat'), card('cable-row')], 0, 2);
    assert.ok(next);
    assert.equal(next[2]?.exerciseId, 'bench-press');
    assert.equal(next[2]?.skippedThisSession, true);
    assert.equal(next[2]?.note, 'left shoulder felt off');
    assert.deepEqual(next[2]?.sets, logged.sets);
    assert.equal(next[0]?.exerciseId, 'squat');
    assert.equal(next[0]?.sets[0]?.completed, false);
  });

  it('helper never writes the plan, a week, or saved routines', () => {
    const src = read('src/lib/workout/sessionReorder.ts');
    assert.doesNotMatch(src, /swapExerciseInPlan/);
    assert.doesNotMatch(src, /savePlan/);
    assert.doesNotMatch(src, /generateWeek/);
    assert.doesNotMatch(src, /savedWorkouts/);
    assert.doesNotMatch(src, /skipExerciseThisSession|swapExerciseThisSession/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/premium/);
    assert.doesNotMatch(src, /UnlockButton|isPremium|\/bundle/);
  });
});
