/**
 * Tests for earn-back dispute status transition.
 *
 * Verifies:
 * - clear action on open status transitions to cleared
 * - reject action on open status transitions to rejected
 * - actions on non-open status fail with not_open
 * - invalid nowMs fails with invalid_now
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transitionDispute } from './earnbackDisputeTransition.ts';
import { type DisputeRequest } from './earnbackDisputeRequest.ts';

function makeOpenRequest(): DisputeRequest {
  return {
    userId: 'user-123',
    sessionId: 'session-456',
    sessionEndIso: '2024-01-01T12:00:00Z',
    openedAtIso: '2024-01-01T13:00:00Z',
    reason: 'The workout did not count correctly',
    status: 'open',
  };
}

test('clear on open → ok, status cleared', () => {
  const request = makeOpenRequest();
  const nowMs = Date.now();

  const result = transitionDispute(request, 'clear', nowMs);

  assert.strictEqual(result.ok, true);
  assert.ok(result.request);
  assert.strictEqual(result.request.status, 'cleared');
  // Other fields unchanged
  assert.strictEqual(result.request.userId, request.userId);
  assert.strictEqual(result.request.sessionId, request.sessionId);
  assert.strictEqual(result.request.reason, request.reason);
});

test('reject on open → ok, status rejected', () => {
  const request = makeOpenRequest();
  const nowMs = Date.now();

  const result = transitionDispute(request, 'reject', nowMs);

  assert.strictEqual(result.ok, true);
  assert.ok(result.request);
  assert.strictEqual(result.request.status, 'rejected');
  // Other fields unchanged
  assert.strictEqual(result.request.userId, request.userId);
  assert.strictEqual(result.request.sessionId, request.sessionId);
  assert.strictEqual(result.request.reason, request.reason);
});

test('clear on already cleared → not_open', () => {
  const request: DisputeRequest = {
    ...makeOpenRequest(),
    status: 'cleared',
  };
  const nowMs = Date.now();

  const result = transitionDispute(request, 'clear', nowMs);

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'not_open');
});

test('reject on already rejected → not_open', () => {
  const request: DisputeRequest = {
    ...makeOpenRequest(),
    status: 'rejected',
  };
  const nowMs = Date.now();

  const result = transitionDispute(request, 'reject', nowMs);

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'not_open');
});

test('NaN nowMs → invalid_now', () => {
  const request = makeOpenRequest();

  const result = transitionDispute(request, 'clear', NaN);

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'invalid_now');
});

test('Infinity nowMs → invalid_now', () => {
  const request = makeOpenRequest();

  const result = transitionDispute(request, 'clear', Infinity);

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'invalid_now');
});

test('-Infinity nowMs → invalid_now', () => {
  const request = makeOpenRequest();

  const result = transitionDispute(request, 'clear', -Infinity);

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'invalid_now');
});

test('returns shallow copy, not mutating original', () => {
  const request = makeOpenRequest();
  const nowMs = Date.now();

  const result = transitionDispute(request, 'clear', nowMs);

  assert.strictEqual(request.status, 'open');
  // Use type guard: assert result is ok before accessing request
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.request.status, 'cleared');
});
