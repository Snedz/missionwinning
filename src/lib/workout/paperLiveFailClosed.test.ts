import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { failReasons, isAuthorized, carryForwardAllowed, type LiveEvidence } from './paperLiveFailClosed.ts';

describe('failReasons', () => {
  it('all true → failReasons []', () => {
    const evidence: LiveEvidence = {
      liveLabelAuthorized: true,
      reviewerPass: true,
      scopeMatches: true,
      decisionFinal: true,
    };
    assert.deepEqual(failReasons(evidence), []);
  });

  it('liveLabelAuthorized null → includes live_label_absent', () => {
    const evidence: LiveEvidence = {
      liveLabelAuthorized: null,
      reviewerPass: true,
      scopeMatches: true,
      decisionFinal: true,
    };
    const reasons = failReasons(evidence);
    assert.ok(reasons.includes('live_label_absent'));
  });

  it('reviewerPass false → includes reviewer_false', () => {
    const evidence: LiveEvidence = {
      liveLabelAuthorized: true,
      reviewerPass: false,
      scopeMatches: true,
      decisionFinal: true,
    };
    const reasons = failReasons(evidence);
    assert.ok(reasons.includes('reviewer_false'));
  });

  it('scopeMatches undefined → includes scope_absent', () => {
    const evidence: LiveEvidence = {
      liveLabelAuthorized: true,
      reviewerPass: true,
      scopeMatches: undefined,
      decisionFinal: true,
    };
    const reasons = failReasons(evidence);
    assert.ok(reasons.includes('scope_absent'));
  });

  it('decisionFinal false → includes decision_false', () => {
    const evidence: LiveEvidence = {
      liveLabelAuthorized: true,
      reviewerPass: true,
      scopeMatches: true,
      decisionFinal: false,
    };
    const reasons = failReasons(evidence);
    assert.ok(reasons.includes('decision_false'));
  });
});

describe('isAuthorized', () => {
  it('all true → isAuthorized true', () => {
    const evidence: LiveEvidence = {
      liveLabelAuthorized: true,
      reviewerPass: true,
      scopeMatches: true,
      decisionFinal: true,
    };
    assert.equal(isAuthorized(evidence), true);
  });

  it('liveLabelAuthorized null → isAuthorized false', () => {
    const evidence: LiveEvidence = {
      liveLabelAuthorized: null,
      reviewerPass: true,
      scopeMatches: true,
      decisionFinal: true,
    };
    assert.equal(isAuthorized(evidence), false);
  });
});

describe('carryForwardAllowed', () => {
  it('carryForwardAllowed(true, false, false) true', () => {
    assert.equal(carryForwardAllowed(true, false, false), true);
  });

  it('carryForwardAllowed(true, true, false) false', () => {
    assert.equal(carryForwardAllowed(true, true, false), false);
  });

  it('carryForwardAllowed(true, false, true) false', () => {
    assert.equal(carryForwardAllowed(true, false, true), false);
  });

  it('carryForwardAllowed(false, false, false) false', () => {
    assert.equal(carryForwardAllowed(false, false, false), false);
  });
});
