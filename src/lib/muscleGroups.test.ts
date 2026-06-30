import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MAJOR_GROUPS, readinessStatusKey } from '@/lib/muscleGroups';

describe('muscleGroups', () => {
  it('readinessStatusKey maps rest days to status keys', () => {
    assert.equal(readinessStatusKey(0), 'todayReadinessRecovering');
    assert.equal(readinessStatusKey(1), 'todayReadinessRecovering');
    assert.equal(readinessStatusKey(2), 'todayReadinessGood');
    assert.equal(readinessStatusKey(3), 'todayReadinessGood');
    assert.equal(readinessStatusKey(4), 'todayReadinessPrime');
    assert.equal(readinessStatusKey(99), 'todayReadinessPrime');
  });

  it('MAJOR_GROUPS has six entries', () => {
    assert.equal(MAJOR_GROUPS.length, 6);
  });
});
