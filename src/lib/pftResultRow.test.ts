/**
 * Service-role PFT rows must score overall_tier and refuse a client class_code.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildPftResultRow } from '@/lib/pftResultRow';
import { scoreFitnessTestSession } from '@/lib/presidentialFitnessTest';

describe('buildPftResultRow', () => {
  it('computes overall_tier from event scores and never copies a client tier', () => {
    const weak = [{ eventId: 'curl_ups' as const, value: 1 }];
    const expected = scoreFitnessTestSession({
      age: 25,
      sex: 'male',
      results: weak,
      completedAt: '2026-08-17T00:00:00.000Z',
    });
    const row = buildPftResultRow('user-1', {
      age: 25,
      sex: 'male',
      results: weak,
      completedAt: '2026-08-17T00:00:00.000Z',
    });
    assert.equal(expected.overallTier, 'below');
    assert.equal(row.overall_tier, expected.overallTier);
    assert.equal(row.session.overallTier, expected.overallTier);
    assert.equal(row.user_id, 'user-1');
  });

  it('scores a presidential curl-up instead of trusting a caller-chosen below', () => {
    const row = buildPftResultRow('user-1', {
      age: 25,
      sex: 'male',
      results: [{ eventId: 'curl_ups', value: 60 }],
      completedAt: '2026-08-17T00:00:00.000Z',
    });
    assert.equal(row.overall_tier, 'presidential');
  });

  it('leaves class_code null — there is no membership table to prove a join', () => {
    const row = buildPftResultRow('user-1', {
      age: 25,
      sex: 'male',
      results: [{ eventId: 'curl_ups', value: 60 }],
      completedAt: '2026-08-17T00:00:00.000Z',
    });
    assert.equal(row.class_code, null);
    assert.equal(Object.prototype.hasOwnProperty.call(row, 'class_code'), true);
  });
});
