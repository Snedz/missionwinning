import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAssessmentResult,
  computeAssessmentRisk,
  countRiskFlags,
  recommendationAllowed,
  resolveProgramGate,
} from './pathfinderAssessment';

describe('pathfinderAssessment', () => {
  it('counts yes/low flags', () => {
    assert.equal(countRiskFlags({ a: 'yes', b: 'no', c: 'low' }), 2);
  });

  it('computes risk tiers', () => {
    assert.equal(computeAssessmentRisk(0), 'low');
    assert.equal(computeAssessmentRisk(1), 'moderate');
    assert.equal(computeAssessmentRisk(4), 'high');
  });

  it('gates high risk to low-impact', () => {
    assert.equal(resolveProgramGate('high', 'regular'), 'low-impact-only');
    assert.equal(resolveProgramGate('high', 'none'), 'low-impact-only');
    assert.equal(resolveProgramGate('low', 'none'), 'standard');
  });

  it('pathfinder high risk uses gentle copy', () => {
    const res = buildAssessmentResult({ chest_pain: 'yes', fainting: 'yes', heart: 'yes' }, 'none');
    assert.equal(res.risk, 'high');
    assert.equal(res.pathfinderTrack, true);
    assert.match(res.notes, /limited doctor access/i);
    assert.equal(res.programGate, 'low-impact-only');
  });

  it('blocks intense recommendations when gated', () => {
    assert.equal(recommendationAllowed('Start with Beginner Full Body', 'low-impact-only'), false);
    assert.equal(recommendationAllowed('Begin with Daily Mobility Circuit', 'low-impact-only'), true);
  });
});
