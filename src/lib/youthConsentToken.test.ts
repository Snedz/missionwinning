import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  YouthConsentMisconfiguredError,
  generateConsentCode,
} from './youthConsentToken.ts';
import { restoreEnv, setTestEnv, snapshotEnv } from './testEnv.ts';

describe('youthConsentToken', () => {
  let envSnapshot: NodeJS.ProcessEnv;

  beforeEach(() => {
    envSnapshot = snapshotEnv();
    delete process.env.YOUTH_CONSENT_SECRET;
    delete process.env.PRIVATE_ACCESS_SECRET;
  });

  afterEach(() => {
    restoreEnv(envSnapshot);
  });

  it('uses dev fallback in non-production', () => {
    setTestEnv('NODE_ENV', 'development');
    const code = generateConsentCode('parent@example.com', 12);
    assert.match(code, /^\d{6}$/);
  });

  it('throws when YOUTH_CONSENT_SECRET missing in production', () => {
    setTestEnv('NODE_ENV', 'production');
    assert.throws(() => generateConsentCode('parent@example.com', 12), YouthConsentMisconfiguredError);
  });
});
