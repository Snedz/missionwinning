import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COPPA_AGE_THRESHOLD,
  isValidParentEmail,
  requiresYouthConsent,
} from '@/lib/youthConsent';

describe('youthConsent', () => {
  it('requires consent under threshold', () => {
    assert.equal(COPPA_AGE_THRESHOLD, 13);
    assert.equal(requiresYouthConsent(12), true);
    assert.equal(requiresYouthConsent(13), false);
  });

  it('validates parent email', () => {
    assert.equal(isValidParentEmail('parent@school.edu'), true);
    assert.equal(isValidParentEmail('not-an-email'), false);
  });
});
