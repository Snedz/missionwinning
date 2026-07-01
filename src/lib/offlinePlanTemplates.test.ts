import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getOfflinePlan, listOfflinePlans } from './offlinePlanTemplates.ts';

describe('offlinePlanTemplates', () => {
  it('includes bodyweight strength plan', () => {
    const plan = getOfflinePlan('bodyweight-strength-4w');
    assert.ok(plan);
    assert.ok(plan!.sessions.length >= 2);
  });

  it('filters to gentle plans when low impact', () => {
    const plans = listOfflinePlans({ lowImpactOnly: true });
    assert.ok(plans.every((p) => p.lowImpactOnly || p.id === 'mobility-recovery-4w'));
    assert.ok(!plans.some((p) => p.id === 'bodyweight-strength-4w'));
  });
});
