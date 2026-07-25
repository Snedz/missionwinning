import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAuthRedirectOrigin,
  isEphemeralVercelHost,
  shouldBounceAuthCallbackToCanonical,
} from './authRedirect.ts';

describe('authRedirect', () => {
  it('detects vercel.app hosts', () => {
    assert.equal(isEphemeralVercelHost('missionwinning-git-preview-example.vercel.app'), true);
    assert.equal(isEphemeralVercelHost('www.missionwinning.com'), false);
  });

  it('never returns vercel.app as OAuth origin', () => {
    const origin = getAuthRedirectOrigin(
      'https://missionwinning-git-preview-example.vercel.app',
      'missionwinning-git-preview-example.vercel.app'
    );
    assert.equal(origin, 'https://www.missionwinning.com');
  });

  it('keeps localhost for local OAuth', () => {
    assert.equal(
      getAuthRedirectOrigin('http://localhost:3000', 'localhost'),
      'http://localhost:3000'
    );
  });

  it('bounces auth callback from vercel.app to www', () => {
    const dest = shouldBounceAuthCallbackToCanonical(
      'missionwinning-git-preview-example.vercel.app',
      'https://www.missionwinning.com'
    );
    assert.equal(dest, 'https://www.missionwinning.com');
  });

  it('does not bounce www callbacks', () => {
    assert.equal(
      shouldBounceAuthCallbackToCanonical('www.missionwinning.com', 'https://www.missionwinning.com'),
      null
    );
  });
});
