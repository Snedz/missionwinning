import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { countsTowardPr, countsTowardVolume } from '@/lib/setKind';

describe('setKind', () => {
  it('warmup sets skip volume and PR', () => {
    assert.equal(countsTowardVolume('warmup'), false);
    assert.equal(countsTowardPr('warmup'), false);
  });

  it('failure sets count toward volume and PR', () => {
    assert.equal(countsTowardVolume('failure'), true);
    assert.equal(countsTowardPr('failure'), true);
  });

  it('normal is default working set', () => {
    assert.equal(countsTowardVolume('normal'), true);
    assert.equal(countsTowardVolume(undefined), true);
  });
});
