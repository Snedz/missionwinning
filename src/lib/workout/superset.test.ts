import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceAfterLog,
  getSupersetPeers,
  pairMark,
  pairWithNext,
  shouldRestAfterLog,
  supersetLabel,
  unpair,
} from './superset';
import type { ActiveExerciseLog } from '@/types';

function ex(id: string, sets: number, group?: string): ActiveExerciseLog {
  return {
    exerciseId: id,
    supersetGroup: group,
    sets: Array.from({ length: sets }, (_, i) => ({
      id: `${id}-${i}`,
      reps: 10,
      weight: 100,
      completed: false,
    })),
  };
}

describe('superset', () => {
  it('groups peers by supersetGroup id', () => {
    const exercises = [ex('a', 2, 'g1'), ex('b', 2, 'g1'), ex('c', 2)];
    assert.deepEqual(getSupersetPeers(exercises, 0), [0, 1]);
    assert.equal(pairMark(exercises, 0), 'A1');
    assert.equal(pairMark(exercises, 1), 'A2');
    assert.equal(supersetLabel(exercises, 1), 'A2');
    assert.equal(pairMark(exercises, 2), null);
  });

  it('numbers a second pair as B1/B2', () => {
    const exercises = [
      ex('a', 2, 'g1'),
      ex('b', 2, 'g1'),
      ex('c', 2, 'g2'),
      ex('d', 2, 'g2'),
    ];
    assert.equal(pairMark(exercises, 2), 'B1');
    assert.equal(pairMark(exercises, 3), 'B2');
  });

  it('pair persist: JSON round-trip keeps the shared group', () => {
    const paired = pairWithNext([ex('a', 2), ex('b', 2)], 0, 'ss-persist');
    const round = JSON.parse(JSON.stringify(paired)) as ActiveExerciseLog[];
    assert.equal(round[0].supersetGroup, 'ss-persist');
    assert.equal(round[1].supersetGroup, 'ss-persist');
    assert.equal(pairMark(round, 0), 'A1');
    assert.equal(pairMark(round, 1), 'A2');
  });

  it('pairWithNext is exactly two and does not merge giant sets', () => {
    const first = pairWithNext([ex('a', 2), ex('b', 2), ex('c', 2)], 0, 'ss-ab');
    const second = pairWithNext(first, 1, 'ss-bc');
    assert.equal(second[0].supersetGroup, undefined);
    assert.equal(second[1].supersetGroup, 'ss-bc');
    assert.equal(second[2].supersetGroup, 'ss-bc');
    assert.equal(pairMark(second, 0), null);
    assert.equal(pairMark(second, 1), 'A1');
    assert.equal(pairMark(second, 2), 'A2');
  });

  it('unpair clears both peers', () => {
    const paired = pairWithNext([ex('a', 2), ex('b', 2), ex('c', 2)], 0, 'ss-ab');
    const cleared = unpair(paired, 1);
    assert.equal(cleared[0].supersetGroup, undefined);
    assert.equal(cleared[1].supersetGroup, undefined);
    assert.equal(cleared[2].supersetGroup, undefined);
  });

  it('advances to peer at same set index before next set', () => {
    const exercises = [ex('a', 2, 'g1'), ex('b', 2, 'g1')];
    exercises[0].sets[0].completed = true;
    const next = advanceAfterLog(exercises, 0, 0);
    assert.deepEqual(next, { exerciseIndex: 1, setIndex: 0 });
  });

  it('skips rest when advancing within superset round', () => {
    const exercises = [ex('a', 2, 'g1'), ex('b', 2, 'g1')];
    const next = { exerciseIndex: 1, setIndex: 0 };
    assert.equal(shouldRestAfterLog(exercises, 0, 0, next), false);
    assert.equal(shouldRestAfterLog(exercises, 1, 0, { exerciseIndex: 0, setIndex: 1 }), true);
  });

  it('log order is A then B then rest', () => {
    const exercises = pairWithNext([ex('a', 2), ex('b', 2)], 0, 'ss-ab');
    exercises[0].sets[0].completed = true;
    const afterA = advanceAfterLog(exercises, 0, 0);
    assert.deepEqual(afterA, { exerciseIndex: 1, setIndex: 0 });
    assert.equal(shouldRestAfterLog(exercises, 0, 0, afterA), false);

    exercises[1].sets[0].completed = true;
    const afterB = advanceAfterLog(exercises, 1, 0);
    assert.deepEqual(afterB, { exerciseIndex: 0, setIndex: 1 });
    assert.equal(shouldRestAfterLog(exercises, 1, 0, afterB), true);
  });
});
