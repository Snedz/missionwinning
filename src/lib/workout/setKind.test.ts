import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  countsTowardPr,
  countsTowardStrengthEstimate,
  countsTowardVolume,
} from '@/lib/workout/setKind';

describe('setKind', () => {
  it('warmup sets skip volume and PR', () => {
    assert.equal(countsTowardVolume('warmup'), false);
    assert.equal(countsTowardPr('warmup'), false);
  });

  /*
   * `.208` — a set taken to failure counts as work, never as a record.
   *
   * This test used to assert `countsTowardPr('failure') === true`, which put the
   * live PR chip in direct conflict with every other consumer of the same
   * number: prior best bench 100x6 (e1RM 116.1), log 100x8 marked failure ->
   * 124.1 -> the brass chip fires and `isPr` is written to the log, while the
   * /benchmarks chart, the debrief and the next session's prescribed load all
   * skip that set and still say 116.1.
   *
   * A set to failure gives the highest and least repeatable e1RM reading, which
   * is exactly why the three estimate consumers refuse it — so the celebration
   * was firing on the one kind of set the rest of the app declines to trust.
   */
  it('failure sets count toward volume but never toward a record', () => {
    assert.equal(countsTowardVolume('failure'), true, 'the work happened');
    assert.equal(countsTowardStrengthEstimate('failure'), false);
    assert.equal(countsTowardPr('failure'), false);
  });

  /*
   * Drop sets are the other half, and they are deliberately *not* symmetric: a
   * drop set is evidence (it feeds e1RM, the chart, the prescribed load) but the
   * burnout at the end of the work is not a moment to celebrate. That is a taste
   * judgement rather than a numeric one, so it lives only in `countsTowardPr`.
   */
  it('drop sets are evidence but not a celebration', () => {
    assert.equal(countsTowardVolume('drop'), true);
    assert.equal(countsTowardStrengthEstimate('drop'), true);
    assert.equal(countsTowardPr('drop'), false);
  });

  it('normal is default working set', () => {
    assert.equal(countsTowardVolume('normal'), true);
    assert.equal(countsTowardVolume(undefined), true);
  });
});
