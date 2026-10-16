/**
 * Lock: 2,000 sessions / 40k sets stay inside the first-paint budget,
 * and memoised bests match brute-force getBestPriorSet.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LARGE_HISTORY_BUDGET_MS,
  LARGE_HISTORY_SESSIONS,
  LARGE_HISTORY_SETS_PER_SESSION,
  bestsMatchBruteForce,
  computeHistoryFirstPaintTotals,
  measureHistoryFirstPaint,
  memoPersonalBests,
  seedLargeHistory,
} from './largeHistoryBudget.ts';
import { getBestPriorSet } from '@/lib/workout/workoutPr';

describe('largeHistoryBudget', () => {
  it('seeds 2,000 sessions and 40,000 sets (newest first)', () => {
    const history = seedLargeHistory();
    assert.equal(history.length, LARGE_HISTORY_SESSIONS);
    let sets = 0;
    for (const log of history) sets += log.exercises[0].sets.length;
    assert.equal(sets, LARGE_HISTORY_SESSIONS * LARGE_HISTORY_SETS_PER_SESSION);
    assert.equal(history[0].id, `lh-${LARGE_HISTORY_SESSIONS - 1}`);
    assert.equal(history[history.length - 1].id, 'lh-0');
  });

  it('memoPersonalBests matches getBestPriorSet for every exercise', () => {
    // Smaller seed for the oracle (still multi-exercise, multi-session).
    const history = seedLargeHistory(120, 20);
    const bests = memoPersonalBests(history);
    assert.equal(bestsMatchBruteForce(history, bests), true);
    for (const [id, memo] of bests) {
      const brute = getBestPriorSet(id, history);
      assert.deepEqual(memo, brute);
    }
  });

  it('tombstones do not contribute to memoised bests or totals', () => {
    const history = seedLargeHistory(10, 5);
    const alive = memoPersonalBests(history);
    history[0] = { ...history[0], deletedAt: '2026-10-15T00:00:00.000Z' };
    const after = memoPersonalBests(history);
    const totals = computeHistoryFirstPaintTotals(history);
    assert.equal(totals.sessionCount, 9);
    assert.equal(totals.career.sessions, 9);
    // Bests may shrink if the deleted session held a record.
    for (const [id, best] of after) {
      const was = alive.get(id);
      if (was) {
        const estWas = was.weight; // shape still present
        assert.ok(best.weight > 0 && estWas > 0);
      }
    }
    assert.equal(bestsMatchBruteForce(history, after), true);
  });

  it('2,000-session first-paint scan pack stays within budget', () => {
    const history = seedLargeHistory();
    const report = measureHistoryFirstPaint(history);
    assert.equal(report.rowCount, LARGE_HISTORY_SESSIONS);
    assert.equal(
      report.setCount,
      LARGE_HISTORY_SESSIONS * LARGE_HISTORY_SETS_PER_SESSION
    );
    assert.ok(
      report.withinBudget,
      `first-paint scan ${report.totalMs.toFixed(1)}ms exceeds ${LARGE_HISTORY_BUDGET_MS}ms budget (list=${report.listMs.toFixed(1)} career=${report.careerMs.toFixed(1)} volume=${report.volumeMs.toFixed(1)} bests=${report.bestsMs.toFixed(1)})`
    );
    const totals = computeHistoryFirstPaintTotals(history);
    assert.equal(totals.sessionCount, LARGE_HISTORY_SESSIONS);
    assert.equal(totals.career.sessions, LARGE_HISTORY_SESSIONS);
    assert.ok(totals.volume > 0);
    assert.ok(totals.bests.size >= 1);
    assert.equal(bestsMatchBruteForce(history, totals.bests), true);
  });
});
