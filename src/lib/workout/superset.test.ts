import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceAfterLog, getSupersetPeers, shouldRestAfterLog, supersetLabel } from './superset';
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
    assert.equal(supersetLabel(exercises, 1), 'SS B');
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
});
