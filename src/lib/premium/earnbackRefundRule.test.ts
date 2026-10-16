/**
 * Tests for earn-back refund rule engine.
 *
 * Verifies:
 * - Full refund only when all required sessions completed
 * - No partial refunds, never more than paid
 * - Dispute, timing, and invalid input handling
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  decideRefund,
  DAY_MS,
  type EarnbackPlan,
  type EarnbackProgress,
} from './earnbackRefundRule.ts';

// Helper to create a timestamp N days from a base date
function daysFrom(isoDate: string, days: number): number {
  return Date.parse(isoDate) + days * DAY_MS;
}

test('all sessions done inside window → eligible, refundCents equals pricePaidCents', () => {
  const plan: EarnbackPlan = {
    planId: 'plan-1',
    startDate: '2024-01-01T00:00:00Z',
    windowDays: 30,
    requiredSessions: 10,
    pricePaidCents: 4999,
  };
  const progress: EarnbackProgress = {
    completedSessions: 10,
    disputeOpen: false,
  };
  const nowMs = daysFrom('2024-01-01', 15); // well within window

  const result = decideRefund(plan, progress, nowMs);

  assert.strictEqual(result.status, 'eligible');
  assert.strictEqual(result.refundCents, 4999);
  assert.strictEqual(result.daysLeft, null);
  assert.ok(result.reason.length > 0);
});

test('window passed with sessions short → missed, refundCents 0, daysLeft 0', () => {
  const plan: EarnbackPlan = {
    planId: 'plan-2',
    startDate: '2024-01-01T00:00:00Z',
    windowDays: 30,
    requiredSessions: 10,
    pricePaidCents: 4999,
  };
  const progress: EarnbackProgress = {
    completedSessions: 5,
    disputeOpen: false,
  };
  const nowMs = daysFrom('2024-01-01', 31); // after window ends

  const result = decideRefund(plan, progress, nowMs);

  assert.strictEqual(result.status, 'missed');
  assert.strictEqual(result.refundCents, 0);
  assert.strictEqual(result.daysLeft, 0);
  assert.ok(result.reason.length > 0);
});

test('mid-window, sessions short → in_progress, daysLeft rounds up', () => {
  const plan: EarnbackPlan = {
    planId: 'plan-3',
    startDate: '2024-01-01T00:00:00Z',
    windowDays: 30,
    requiredSessions: 10,
    pricePaidCents: 4999,
  };
  const progress: EarnbackProgress = {
    completedSessions: 3,
    disputeOpen: false,
  };
  const nowMs = daysFrom('2024-01-01', 20) + 1; // 20 days + 1ms into window

  const result = decideRefund(plan, progress, nowMs);

  assert.strictEqual(result.status, 'in_progress');
  assert.strictEqual(result.refundCents, 0);
  assert.strictEqual(result.daysLeft, 10); // ceil((30*DAY_MS - 20*DAY_MS - 1ms) / DAY_MS) = ceil(9.999...) = 10
  assert.ok(result.reason.length > 0);
});

test('before start → not_started, daysLeft = windowDays', () => {
  const plan: EarnbackPlan = {
    planId: 'plan-4',
    startDate: '2024-02-01T00:00:00Z',
    windowDays: 30,
    requiredSessions: 10,
    pricePaidCents: 4999,
  };
  const progress: EarnbackProgress = {
    completedSessions: 0,
    disputeOpen: false,
  };
  const nowMs = Date.parse('2024-01-15T12:00:00Z'); // before start

  const result = decideRefund(plan, progress, nowMs);

  assert.strictEqual(result.status, 'not_started');
  assert.strictEqual(result.refundCents, 0);
  assert.strictEqual(result.daysLeft, 30);
  assert.ok(result.reason.length > 0);
});

test('disputeOpen true even when sessions done → on_hold, refundCents 0', () => {
  const plan: EarnbackPlan = {
    planId: 'plan-5',
    startDate: '2024-01-01T00:00:00Z',
    windowDays: 30,
    requiredSessions: 10,
    pricePaidCents: 4999,
  };
  const progress: EarnbackProgress = {
    completedSessions: 10,
    disputeOpen: true,
  };
  const nowMs = daysFrom('2024-01-01', 15);

  const result = decideRefund(plan, progress, nowMs);

  assert.strictEqual(result.status, 'on_hold');
  assert.strictEqual(result.refundCents, 0);
  assert.strictEqual(result.daysLeft, null);
  assert.ok(result.reason.length > 0);
});

test('bad startDate, requiredSessions 0, or negative price → invalid, refundCents 0', () => {
  // Invalid startDate
  const planBadDate: EarnbackPlan = {
    planId: 'plan-6',
    startDate: 'not-a-date',
    windowDays: 30,
    requiredSessions: 10,
    pricePaidCents: 4999,
  };
  const progress: EarnbackProgress = { completedSessions: 0, disputeOpen: false };
  const nowMs = Date.now();

  let result = decideRefund(planBadDate, progress, nowMs);
  assert.strictEqual(result.status, 'invalid');
  assert.strictEqual(result.refundCents, 0);
  assert.strictEqual(result.daysLeft, null);

  // requiredSessions = 0
  const planZeroRequired: EarnbackPlan = {
    planId: 'plan-7',
    startDate: '2024-01-01T00:00:00Z',
    windowDays: 30,
    requiredSessions: 0,
    pricePaidCents: 4999,
  };
  result = decideRefund(planZeroRequired, progress, nowMs);
  assert.strictEqual(result.status, 'invalid');

  // negative pricePaidCents
  const planNegativePrice: EarnbackPlan = {
    planId: 'plan-8',
    startDate: '2024-01-01T00:00:00Z',
    windowDays: 30,
    requiredSessions: 10,
    pricePaidCents: -100,
  };
  result = decideRefund(planNegativePrice, progress, nowMs);
  assert.strictEqual(result.status, 'invalid');

  // windowDays = 0
  const planZeroWindow: EarnbackPlan = {
    planId: 'plan-9',
    startDate: '2024-01-01T00:00:00Z',
    windowDays: 0,
    requiredSessions: 10,
    pricePaidCents: 4999,
  };
  result = decideRefund(planZeroWindow, progress, nowMs);
  assert.strictEqual(result.status, 'invalid');
});
