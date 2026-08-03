import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { consoleMatchesTarget, shouldOfferUseNext } from './loggerSpeed.ts';

describe('loggerSpeed', () => {
  it('matches when reps and weight equal the target', () => {
    assert.equal(consoleMatchesTarget(9, 60, { reps: 9, weight: 60 }), true);
    assert.equal(consoleMatchesTarget(8, 60, { reps: 9, weight: 60 }), false);
    assert.equal(consoleMatchesTarget(9, 60, null), false);
  });

  it('offers Use next only when dialed values differ', () => {
    assert.equal(shouldOfferUseNext(8, 60, { reps: 9, weight: 60 }), true);
    assert.equal(shouldOfferUseNext(9, 60, { reps: 9, weight: 60 }), false);
    assert.equal(shouldOfferUseNext(9, 60, null), false);
  });
});
