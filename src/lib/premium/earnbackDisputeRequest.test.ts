/**
 * Tests for earn-back dispute request helpers.
 *
 * Verifies:
 * - buildDisputeRequest validates all inputs and enforces 72h window
 * - disputeStillOpen correctly checks open status and window
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDisputeRequest, disputeStillOpen, type DisputeRequest } from './earnbackDisputeRequest.ts';

function hoursFrom(baseMs: number, hours: number): number {
  return baseMs + hours * 60 * 60 * 1000;
}

test('happy path inside 71h → ok true, status open', () => {
  const sessionEnd = '2024-01-01T12:00:00Z';
  const endMs = Date.parse(sessionEnd);
  const openedAt = new Date(hoursFrom(endMs, 71)).toISOString();

  const result = buildDisputeRequest({
    userId: 'user-123',
    sessionId: 'session-456',
    sessionEndIso: sessionEnd,
    openedAtIso: openedAt,
    reason: 'The workout did not count correctly',
  });

  assert.strictEqual(result.ok, true);
  assert.ok(result.request);
  assert.strictEqual(result.request.status, 'open');
  assert.strictEqual(result.request.userId, 'user-123');
  assert.strictEqual(result.request.sessionId, 'session-456');
  assert.strictEqual(result.request.reason, 'The workout did not count correctly');
});

test('opened at 73h → ok false outside_dispute_window', () => {
  const sessionEnd = '2024-01-01T12:00:00Z';
  const endMs = Date.parse(sessionEnd);
  const openedAt = new Date(hoursFrom(endMs, 73)).toISOString();

  const result = buildDisputeRequest({
    userId: 'user-123',
    sessionId: 'session-456',
    sessionEndIso: sessionEnd,
    openedAtIso: openedAt,
    reason: 'Late dispute',
  });

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'outside_dispute_window');
});

test('empty reason → ok false', () => {
  const sessionEnd = '2024-01-01T12:00:00Z';
  const openedAt = sessionEnd;

  const result = buildDisputeRequest({
    userId: 'user-123',
    sessionId: 'session-456',
    sessionEndIso: sessionEnd,
    openedAtIso: openedAt,
    reason: '   ',
  });

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'reason_empty');
});

test('reason 501 chars → ok false', () => {
  const sessionEnd = '2024-01-01T12:00:00Z';
  const openedAt = sessionEnd;
  const longReason = 'a'.repeat(501);

  const result = buildDisputeRequest({
    userId: 'user-123',
    sessionId: 'session-456',
    sessionEndIso: sessionEnd,
    openedAtIso: openedAt,
    reason: longReason,
  });

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'reason_too_long');
});

test('empty userId → ok false', () => {
  const result = buildDisputeRequest({
    userId: '   ',
    sessionId: 'session-456',
    sessionEndIso: '2024-01-01T12:00:00Z',
    openedAtIso: '2024-01-01T12:00:00Z',
    reason: 'Reason',
  });

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'userId_empty');
});

test('empty sessionId → ok false', () => {
  const result = buildDisputeRequest({
    userId: 'user-123',
    sessionId: '   ',
    sessionEndIso: '2024-01-01T12:00:00Z',
    openedAtIso: '2024-01-01T12:00:00Z',
    reason: 'Reason',
  });

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'sessionId_empty');
});

test('invalid sessionEndIso → ok false', () => {
  const result = buildDisputeRequest({
    userId: 'user-123',
    sessionId: 'session-456',
    sessionEndIso: 'not-a-date',
    openedAtIso: '2024-01-01T12:00:00Z',
    reason: 'Reason',
  });

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'invalid_session_end_date');
});

test('invalid openedAtIso → ok false', () => {
  const result = buildDisputeRequest({
    userId: 'user-123',
    sessionId: 'session-456',
    sessionEndIso: '2024-01-01T12:00:00Z',
    openedAtIso: 'also-not-a-date',
    reason: 'Reason',
  });

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'invalid_opened_at_date');
});

test('disputeStillOpen true while open and inside window', () => {
  const sessionEnd = '2024-01-01T12:00:00Z';
  const endMs = Date.parse(sessionEnd);
  const openedAt = new Date(hoursFrom(endMs, 1)).toISOString();
  const nowMs = hoursFrom(endMs, 24); // 24 hours after session end, still in window

  const request: DisputeRequest = {
    userId: 'user-123',
    sessionId: 'session-456',
    sessionEndIso: sessionEnd,
    openedAtIso: openedAt,
    reason: 'Reason',
    status: 'open',
  };

  assert.strictEqual(disputeStillOpen(request, nowMs), true);
});

test('disputeStillOpen false after clear status', () => {
  const sessionEnd = '2024-01-01T12:00:00Z';
  const endMs = Date.parse(sessionEnd);
  const openedAt = new Date(hoursFrom(endMs, 1)).toISOString();
  const nowMs = hoursFrom(endMs, 24);

  const request: DisputeRequest = {
    userId: 'user-123',
    sessionId: 'session-456',
    sessionEndIso: sessionEnd,
    openedAtIso: openedAt,
    reason: 'Reason',
    status: 'cleared',
  };

  assert.strictEqual(disputeStillOpen(request, nowMs), false);
});

test('disputeStillOpen false after rejected status', () => {
  const sessionEnd = '2024-01-01T12:00:00Z';
  const endMs = Date.parse(sessionEnd);
  const openedAt = new Date(hoursFrom(endMs, 1)).toISOString();
  const nowMs = hoursFrom(endMs, 24);

  const request: DisputeRequest = {
    userId: 'user-123',
    sessionId: 'session-456',
    sessionEndIso: sessionEnd,
    openedAtIso: openedAt,
    reason: 'Reason',
    status: 'rejected',
  };

  assert.strictEqual(disputeStillOpen(request, nowMs), false);
});

test('disputeStillOpen false past window', () => {
  const sessionEnd = '2024-01-01T12:00:00Z';
  const endMs = Date.parse(sessionEnd);
  const openedAt = new Date(hoursFrom(endMs, 1)).toISOString();
  const nowMs = hoursFrom(endMs, 80); // 80 hours after session end, past 72h window

  const request: DisputeRequest = {
    userId: 'user-123',
    sessionId: 'session-456',
    sessionEndIso: sessionEnd,
    openedAtIso: openedAt,
    reason: 'Reason',
    status: 'open',
  };

  assert.strictEqual(disputeStillOpen(request, nowMs), false);
});

test('buildDisputeRequest trims whitespace from inputs', () => {
  const sessionEnd = '2024-01-01T12:00:00Z';
  const openedAt = sessionEnd;

  const result = buildDisputeRequest({
    userId: '  user-123  ',
    sessionId: '  session-456  ',
    sessionEndIso: sessionEnd,
    openedAtIso: openedAt,
    reason: '  Some reason  ',
  });

  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.request.userId, 'user-123');
  assert.strictEqual(result.request.sessionId, 'session-456');
  assert.strictEqual(result.request.reason, 'Some reason');
});
