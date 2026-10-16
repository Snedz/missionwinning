import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { LedgerRow, LedgerEvent } from './earnbackLedgerProgress.js';
import { applyLedgerEvent } from './earnbackLedgerProgress.js';

function makeRow(overrides: Partial<LedgerRow> = {}): LedgerRow {
  return {
    planId: 'plan_123',
    startDate: '2024-01-01',
    windowDays: 30,
    requiredSessions: 3,
    pricePaidCents: 9999,
    completedSessions: 0,
    disputeOpen: false,
    ...overrides,
  };
}

test('session_counted increments completedSessions by 1 and does not mutate input', () => {
  const row = makeRow({ completedSessions: 1 });
  const event: LedgerEvent = { type: 'session_counted' };
  const nowMs = Date.parse('2024-01-15');

  const result = applyLedgerEvent(row, event, nowMs);

  assert.strictEqual(result.row.completedSessions, 2);
  assert.strictEqual(row.completedSessions, 1, 'input must not be mutated');
});

test('session_counted at requiredSessions stays at requiredSessions (no overflow)', () => {
  const row = makeRow({ completedSessions: 3, requiredSessions: 3 });
  const event: LedgerEvent = { type: 'session_counted' };
  const nowMs = Date.parse('2024-01-15');

  const result = applyLedgerEvent(row, event, nowMs);

  assert.strictEqual(result.row.completedSessions, 3);
});

test('dispute_opened sets disputeOpen true and decision status is on_hold even when sessions complete', () => {
  const row = makeRow({ completedSessions: 3, disputeOpen: false });
  const event: LedgerEvent = { type: 'dispute_opened' };
  const nowMs = Date.parse('2024-01-15');

  const result = applyLedgerEvent(row, event, nowMs);

  assert.strictEqual(result.row.disputeOpen, true);
  assert.strictEqual(result.decision.status, 'on_hold');
});

test('dispute_cleared clears disputeOpen', () => {
  const row = makeRow({ disputeOpen: true });
  const event: LedgerEvent = { type: 'dispute_cleared' };
  const nowMs = Date.parse('2024-01-15');

  const result = applyLedgerEvent(row, event, nowMs);

  assert.strictEqual(result.row.disputeOpen, false);
});

test('after enough session_counted inside window → decision status eligible, refundCents equals pricePaidCents', () => {
  const row = makeRow({ completedSessions: 2, requiredSessions: 3, pricePaidCents: 9999 });
  const event: LedgerEvent = { type: 'session_counted' };
  // 15 days in, window not passed yet
  const nowMs = Date.parse('2024-01-16');

  const result = applyLedgerEvent(row, event, nowMs);

  assert.strictEqual(result.row.completedSessions, 3);
  assert.strictEqual(result.decision.status, 'eligible');
  assert.strictEqual(result.decision.refundCents, 9999);
});

test('window already passed with sessions short → session_counted still applies but decision status missed', () => {
  const row = makeRow({ completedSessions: 1, requiredSessions: 3 });
  const event: LedgerEvent = { type: 'session_counted' };
  // 31 days in, window of 30 days already passed
  const nowMs = Date.parse('2024-02-01');

  const result = applyLedgerEvent(row, event, nowMs);

  assert.strictEqual(result.row.completedSessions, 2);
  assert.strictEqual(result.decision.status, 'missed');
});
