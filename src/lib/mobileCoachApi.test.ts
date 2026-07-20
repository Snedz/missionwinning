import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applySessionDone, buildMobileCoachPlan } from './mobileCoachApi';

describe('mobileCoachApi', () => {
  it('builds a seed plan with three sessions', () => {
    const { plan, hasAdaptSignal } = buildMobileCoachPlan();
    assert.equal(plan.daysPerWeek, 3);
    assert.equal(plan.sessions.length, 3);
    assert.equal(hasAdaptSignal, false);
  });

  it('adapt demo exposes miss/swap beats', () => {
    const { plan, adaptBeats, hasAdaptSignal } = buildMobileCoachPlan({
      withAdaptDemo: true,
    });
    assert.equal(hasAdaptSignal, true);
    assert.ok(adaptBeats.length >= 1);
    assert.ok(plan.sessions.some((s) => s.status === 'missed' || s.status === 'swapped'));
  });

  it('mark session done bumps revision', () => {
    const { plan } = buildMobileCoachPlan();
    const sessionId = plan.sessions.find((s) => s.status === 'planned')!.id;
    const next = applySessionDone(plan, sessionId);
    assert.equal(next.plan.revision, plan.revision + 1);
    assert.equal(next.plan.sessions.find((s) => s.id === sessionId)?.status, 'done');
    assert.equal(next.hasAdaptSignal, true);
  });
});
