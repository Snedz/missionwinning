import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isIDayComplete } from '@/lib/missionJourney';

describe('missionJourney', () => {
  it('isIDayComplete returns boolean', () => {
    const result = isIDayComplete();
    assert.equal(typeof result, 'boolean');
  });
});
