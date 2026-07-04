import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateCoachPlan } from '@/lib/coachPlan';

describe('coachPlan', () => {
  it('generates bodyweight plan', () => {
    const plan = generateCoachPlan({
      readiness: 70,
      strain: 40,
      recovery: 70,
      equipment: 'bodyweight',
    });
    assert.equal(plan.days.length, 3);
    assert.ok(plan.days[0].exercises[0].exerciseId);
    assert.equal(plan.deload, false);
  });

  it('applies deload when strain is high', () => {
    const plan = generateCoachPlan({
      readiness: 50,
      strain: 80,
      recovery: 35,
      equipment: 'full-gym',
    });
    assert.equal(plan.deload, true);
    assert.ok(plan.summary.includes('recovery'));
  });
});
