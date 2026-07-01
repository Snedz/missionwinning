import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRestClock,
  getSuggestedRestSeconds,
  resolveRestSeconds,
  restProgress,
} from '@/lib/restTimer';

describe('restTimer', () => {
  it('suggests longer rest for compounds', () => {
    assert.equal(getSuggestedRestSeconds('Barbell Back Squat'), 180);
    assert.equal(getSuggestedRestSeconds('Hammer Curl'), 60);
    assert.equal(getSuggestedRestSeconds('Lat Pulldown'), 90);
  });

  it('formats rest clock', () => {
    assert.equal(formatRestClock(45), '45s');
    assert.equal(formatRestClock(90), '1:30');
  });

  it('computes progress ratio', () => {
    assert.equal(restProgress(90, 45), 0.5);
    assert.equal(restProgress(90, 0), 0);
  });

  it('resolveRestSeconds uses max of suggested and default', () => {
    const rest = resolveRestSeconds('Hammer Curl');
    assert.ok(rest >= 60);
  });
});
