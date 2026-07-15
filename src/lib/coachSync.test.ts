import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mergeCoachPlans } from './coachSync.ts';
import type { CoachPlan } from '@/lib/coach/types';

function plan(revision: number, weekStart = '2026-07-07'): CoachPlan {
  return {
    weekStart,
    revision,
    daysPerWeek: 3,
    sessions: [],
    generatedAt: new Date().toISOString(),
    contextHash: 'test',
    equipmentProfile: 'bodyweight',
  };
}

describe('mergeCoachPlans', () => {
  it('returns non-null side when other is null', () => {
    const p = plan(1);
    assert.equal(mergeCoachPlans(p, null), p);
    assert.equal(mergeCoachPlans(null, p), p);
    assert.equal(mergeCoachPlans(null, null), null);
  });

  it('prefers higher revision', () => {
    const low = plan(1);
    const high = plan(3);
    assert.equal(mergeCoachPlans(low, high), high);
    assert.equal(mergeCoachPlans(high, low), high);
  });
});
