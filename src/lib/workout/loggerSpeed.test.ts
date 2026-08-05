import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  consoleMatchesTarget,
  shouldOfferUseNext,
  shouldShowSetKindExpand,
  visibleSetKinds,
} from './loggerSpeed.ts';
import { SET_KINDS } from './setKind.ts';

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

  it('collapses set kinds to Work only on the default outdoor path', () => {
    assert.deepEqual(visibleSetKinds('normal', false), ['normal']);
    assert.equal(shouldShowSetKindExpand('normal', false), true);
  });

  it('expands all kinds when open or non-work selected', () => {
    assert.deepEqual(visibleSetKinds('normal', true), SET_KINDS);
    assert.deepEqual(visibleSetKinds('warmup', false), SET_KINDS);
    assert.equal(shouldShowSetKindExpand('warmup', false), false);
    assert.equal(shouldShowSetKindExpand('normal', true), false);
  });
});
