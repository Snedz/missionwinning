import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isJourneyBypassPath,
  isPrivateGatePublicPath,
  JOURNEY_BYPASS_PATHS,
} from '@/lib/publicRoutes';

describe('publicRoutes', () => {
  it('bypasses info and marketing paths pre-I-Day', () => {
    assert.equal(isJourneyBypassPath('/about'), true);
    assert.equal(isJourneyBypassPath('/changelog'), true);
    assert.equal(isJourneyBypassPath('/feedback'), true);
    assert.equal(isJourneyBypassPath('/calculators'), true);
    assert.equal(isJourneyBypassPath('/press'), true);
    assert.equal(isJourneyBypassPath('/notify'), true);
    assert.equal(isJourneyBypassPath('/join/class/MW-TEST'), true);
    assert.equal(isJourneyBypassPath('/log'), true);
    assert.equal(isJourneyBypassPath('/active'), true);
    assert.equal(isJourneyBypassPath('/coach'), true);
    assert.equal(isJourneyBypassPath('/history'), true);
  });

  it('includes join class prefix in bypass list', () => {
    assert.ok(JOURNEY_BYPASS_PATHS.includes('/join/class'));
  });

  it('allows private gate public paths', () => {
    assert.equal(isPrivateGatePublicPath('/changelog'), true);
    assert.equal(isPrivateGatePublicPath('/vision'), true);
    assert.equal(isPrivateGatePublicPath('/beta'), true);
    assert.equal(isPrivateGatePublicPath('/press'), true);
    assert.equal(isPrivateGatePublicPath('/notify'), true);
    assert.equal(isPrivateGatePublicPath('/log'), true);
    assert.equal(isPrivateGatePublicPath('/active'), true);
    assert.equal(isPrivateGatePublicPath('/_next/static/chunk.js'), true);
  });
});
