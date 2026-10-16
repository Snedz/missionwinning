/**
 * Tests for earn-back verified session rules.
 *
 * Verifies:
 * - sessionCounts correctly identifies satisfied planned exercises
 * - disputeDeadline calculates the 72-hour window
 * - canDispute enforces the dispute window boundaries
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sessionCounts,
  disputeDeadline,
  canDispute,
  DISPUTE_WINDOW_MS,
} from './earnbackVerifiedSession.ts';

// Helper to create a timestamp N hours from a base time
function hoursFrom(baseMs: number, hours: number): number {
  return baseMs + hours * 60 * 60 * 1000;
}

test('every planned exercise has a working set with reps >= 1 → counts true, missing []', () => {
  const planned = ['ex-1', 'ex-2', 'ex-3'];
  const sets = [
    { exerciseId: 'ex-1', isWorking: true, reps: 10 },
    { exerciseId: 'ex-2', isWorking: true, reps: 8 },
    { exerciseId: 'ex-3', isWorking: true, reps: 12 },
  ];

  const result = sessionCounts(planned, sets);
  assert.strictEqual(result.counts, true);
  assert.deepEqual(result.missing, []);
});

test('one planned exercise has only warm-up sets → counts false, missing lists it', () => {
  const planned = ['ex-1', 'ex-2'];
  const sets = [
    { exerciseId: 'ex-1', isWorking: true, reps: 10 },
    { exerciseId: 'ex-2', isWorking: false, reps: 5 }, // warm-up, not working
  ];

  const result = sessionCounts(planned, sets);
  assert.strictEqual(result.counts, false);
  assert.deepEqual(result.missing, ['ex-2']);
});

test('a working set with reps 0 does not satisfy the exercise', () => {
  const planned = ['ex-1'];
  const sets = [{ exerciseId: 'ex-1', isWorking: true, reps: 0 }];

  const result = sessionCounts(planned, sets);
  assert.strictEqual(result.counts, false);
  assert.deepEqual(result.missing, ['ex-1']);
});

test('empty planned list → counts false', () => {
  const planned: string[] = [];
  const sets = [{ exerciseId: 'ex-1', isWorking: true, reps: 10 }];

  const result = sessionCounts(planned, sets);
  assert.strictEqual(result.counts, false);
  assert.deepEqual(result.missing, []);
});

test('unplanned-exercise sets alone → counts false, missing = all planned', () => {
  const planned = ['ex-1', 'ex-2'];
  const sets = [
    { exerciseId: 'ex-3', isWorking: true, reps: 10 }, // not planned
    { exerciseId: 'ex-4', isWorking: true, reps: 5 },  // not planned
  ];

  const result = sessionCounts(planned, sets);
  assert.strictEqual(result.counts, false);
  assert.deepEqual(result.missing, ['ex-1', 'ex-2']);
});

test('disputeDeadline returns correct timestamp and validates input', () => {
  const endIso = '2024-01-01T12:00:00Z';
  const endMs = Date.parse(endIso);
  
  const deadline = disputeDeadline(endIso);
  assert.strictEqual(deadline, endMs + DISPUTE_WINDOW_MS);
  
  // Verify DISPUTE_WINDOW_MS equals 72 hours
  assert.strictEqual(DISPUTE_WINDOW_MS, 72 * 60 * 60 * 1000);
  
  // Invalid dates return null
  assert.strictEqual(disputeDeadline('not-a-date'), null);
  assert.strictEqual(disputeDeadline(''), null);
});

test('canDispute true at end + 71h, false at end + 73h, false for invalid date', () => {
  const endIso = '2024-01-01T12:00:00Z';
  const endMs = Date.parse(endIso);

  // At end + 71 hours (within window)
  const withinWindow = hoursFrom(endMs, 71);
  assert.strictEqual(canDispute(endIso, withinWindow), true, 'should allow dispute at 71h');

  // At end + 73 hours (past window)
  const pastWindow = hoursFrom(endMs, 73);
  assert.strictEqual(canDispute(endIso, pastWindow), false, 'should deny dispute at 73h');

  // Invalid date
  assert.strictEqual(canDispute('not-a-date', Date.now()), false, 'should deny dispute for invalid date');
  assert.strictEqual(canDispute('', Date.now()), false, 'should deny dispute for empty date');
});
