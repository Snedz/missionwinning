import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  YouthConsentMisconfiguredError,
  generateConsentCode,
} from './youthConsentToken.ts';

describe('youthConsentToken', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.YOUTH_CONSENT_SECRET;
    delete process.env.PRIVATE_ACCESS_SECRET;
  });

  afterEach(() => {
    process.env = env;
  });

  it('uses dev fallback in non-production', () => {
    process.env.NODE_ENV = 'development';
    const code = generateConsentCode('parent@example.com', 12);
    assert.match(code, /^\d{6}$/);
  });

  it('throws when YOUTH_CONSENT_SECRET missing in production', () => {
    process.env.NODE_ENV = 'production';
    assert.throws(() => generateConsentCode('parent@example.com', 12), YouthConsentMisconfiguredError);
  });
});
