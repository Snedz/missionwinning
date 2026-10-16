import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { labelRow, isLiveAuthorized, type LiveAuthEvidence } from './paperLiveLabel.ts';

describe('labelRow', () => {
  it('paper prefixes correctly', () => {
    const result = labelRow('paper', 'some workout data');
    assert.equal(result, '[Paper] some workout data');
  });

  it('live prefixes correctly', () => {
    const result = labelRow('live', 'some workout data');
    assert.equal(result, '[Live] some workout data');
  });

  it('empty body keeps prefix with trailing space', () => {
    assert.equal(labelRow('paper', ''), '[Paper] ');
    assert.equal(labelRow('live', ''), '[Live] ');
  });
});

describe('isLiveAuthorized', () => {
  it('all true → true', () => {
    const evidence: LiveAuthEvidence = {
      liveLabelAuthorized: true,
      reviewerPass: true,
      scopeMatches: true,
      decisionFinal: true,
    };
    assert.equal(isLiveAuthorized(evidence), true);
  });

  it('absent liveLabelAuthorized → false', () => {
    const evidence = {
      // liveLabelAuthorized missing (undefined)
      reviewerPass: true,
      scopeMatches: true,
      decisionFinal: true,
    } as LiveAuthEvidence;
    assert.equal(isLiveAuthorized(evidence), false);
  });

  it('conflicting reviewerPass false → false', () => {
    const evidence: LiveAuthEvidence = {
      liveLabelAuthorized: true,
      reviewerPass: false,
      scopeMatches: true,
      decisionFinal: true,
    };
    assert.equal(isLiveAuthorized(evidence), false);
  });

  it('scopeMatches undefined → false', () => {
    const evidence: LiveAuthEvidence = {
      liveLabelAuthorized: true,
      reviewerPass: true,
      scopeMatches: undefined,
      decisionFinal: true,
    };
    assert.equal(isLiveAuthorized(evidence), false);
  });

  it('null values → false', () => {
    const evidence: LiveAuthEvidence = {
      liveLabelAuthorized: null,
      reviewerPass: null,
      scopeMatches: null,
      decisionFinal: null,
    };
    assert.equal(isLiveAuthorized(evidence), false);
  });
});
