import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOverloadCue,
  formatOverloadSetLine,
  overloadReasonDefault,
  overloadReasonKey,
} from './progressiveOverloadCue.ts';

describe('buildOverloadCue', () => {
  it('shows last and next with add_reps reason', () => {
    const c = buildOverloadCue({
      last: { reps: 8, weight: 60 },
      next: { reps: 9, weight: 60 },
      reason: 'add_reps',
    });
    assert.deepEqual(c.last, { reps: 8, weight: 60 });
    assert.deepEqual(c.next, { reps: 9, weight: 60 });
    assert.equal(c.reason, 'add_reps');
  });

  it('drops redundant next when identical to last (hold)', () => {
    const c = buildOverloadCue({
      last: { reps: 10, weight: 50 },
      next: { reps: 10, weight: 50 },
      reason: 'hold',
    });
    assert.ok(c.last);
    assert.equal(c.next, null);
    assert.equal(c.reason, 'hold');
  });

  it('keeps coach prescription even when equal to last', () => {
    const c = buildOverloadCue({
      last: { reps: 5, weight: 100 },
      next: { reps: 5, weight: 100 },
      prescribed: true,
    });
    assert.deepEqual(c.next, { reps: 5, weight: 100 });
    assert.equal(c.reason, 'prescribed');
  });

  it('returns empty when neither last nor next', () => {
    const c = buildOverloadCue({ last: null, next: null });
    assert.equal(c.last, null);
    assert.equal(c.next, null);
    assert.equal(c.reason, null);
  });

  it('next only with from_last default reason', () => {
    const c = buildOverloadCue({
      last: null,
      next: { reps: 8, weight: 40 },
    });
    assert.equal(c.last, null);
    assert.deepEqual(c.next, { reps: 8, weight: 40 });
    assert.equal(c.reason, 'from_last');
  });
});

describe('formatOverloadSetLine', () => {
  it('formats weighted and bodyweight', () => {
    assert.equal(formatOverloadSetLine(8, 60, 'kg'), '8 × 60 kg');
    assert.equal(formatOverloadSetLine(10, 0, 'kg', 'BW'), '10 × BW');
    assert.equal(formatOverloadSetLine(8, 20, 'kg', 'BW', true), '8 × BW + 20 kg');
  });
});

describe('overloadReason*', () => {
  it('maps reason codes', () => {
    assert.equal(overloadReasonKey('add_reps'), 'activeOverloadAddReps');
    assert.equal(overloadReasonDefault('add_weight'), 'Add weight');
    assert.equal(overloadReasonDefault('prescribed'), 'Coach plan');
    assert.equal(overloadReasonKey(null), null);
  });
});
