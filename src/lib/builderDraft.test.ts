import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reorderDraftExercises } from './builderDraft';

describe('builderDraft', () => {
  it('moves item up', () => {
    const items = ['a', 'b', 'c'];
    assert.deepEqual(reorderDraftExercises(items, 1, 'up'), ['b', 'a', 'c']);
  });

  it('moves item down', () => {
    const items = ['a', 'b', 'c'];
    assert.deepEqual(reorderDraftExercises(items, 0, 'down'), ['b', 'a', 'c']);
  });

  it('no-ops at bounds', () => {
    const items = ['a', 'b'];
    assert.deepEqual(reorderDraftExercises(items, 0, 'up'), items);
    assert.deepEqual(reorderDraftExercises(items, 1, 'down'), items);
  });
});
