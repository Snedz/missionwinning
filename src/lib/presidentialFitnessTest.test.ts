import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  awardLabel,
  formatMileTime,
  parseMileTime,
  resolveAgeBand,
  scoreEvent,
  scoreFitnessTestSession,
} from '@/lib/presidentialFitnessTest';

describe('presidentialFitnessTest', () => {
  it('resolves age bands', () => {
    assert.equal(resolveAgeBand(11), '10-13');
    assert.equal(resolveAgeBand(16), '14-17');
    assert.equal(resolveAgeBand(25), '18-39');
    assert.equal(resolveAgeBand(55), '40+');
  });

  it('scores curl-ups for presidential tier', () => {
    const scored = scoreEvent('curl_ups', 60, 25, 'male');
    assert.equal(scored.tier, 'presidential');
  });

  it('scores mile run — lower time is better', () => {
    const fast = scoreEvent('mile_run', 390, 25, 'male');
    const slow = scoreEvent('mile_run', 700, 25, 'male');
    assert.equal(fast.tier, 'presidential');
    assert.equal(slow.tier, 'below');
  });

  it('scores a mini session with overall tier', () => {
    const session = scoreFitnessTestSession({
      age: 12,
      sex: 'female',
      mode: 'mini',
      results: [
        { eventId: 'curl_ups', value: 42 },
        { eventId: 'push_ups', value: 25 },
      ],
    });
    assert.equal(session.mode, 'mini');
    assert.equal(session.events.length, 2);
    assert.ok(['presidential', 'national', 'participant', 'below'].includes(session.overallTier));
  });

  it('formats and parses mile times', () => {
    assert.equal(formatMileTime(390), '6:30');
    assert.equal(parseMileTime('6:30'), 390);
    assert.equal(parseMileTime('420'), 420);
  });

  it('maps award labels', () => {
    assert.equal(awardLabel('presidential'), 'Presidential');
    assert.equal(awardLabel('below'), 'Keep training');
  });
});
