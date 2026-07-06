import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertDeployReady,
  assertProductionEnvConfig,
  getDeployReadinessReport,
  validateBuildLabel,
} from '@/lib/deployReadiness';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv.ts';

describe('deployReadiness', () => {
  it('validates build label format', () => {
    assert.equal(validateBuildLabel('2025.06-unified.22'), true);
    assert.equal(validateBuildLabel('bad'), false);
  });

  it('report includes locale export plan', () => {
    const r = getDeployReadinessReport();
    assert.equal(r.localeFiles, 242);
    assert.equal(r.localeNamespaces, 22);
    assert.ok(r.minTodayKeys >= 100);
    assert.equal(r.target, 'ci');
  });

  it('assertDeployReady passes on integration branch', () => {
    assert.doesNotThrow(() => assertDeployReady());
  });

  describe('production target', () => {
    let envSnapshot: NodeJS.ProcessEnv;

    beforeEach(() => {
      envSnapshot = snapshotEnv();
      setTestEnv('DEPLOY_READINESS_TARGET', 'production');
    });

    afterEach(() => {
      restoreEnv(envSnapshot);
    });

    it('rejects DEMO_PREMIUM=true', () => {
      setTestEnv('DEMO_PREMIUM', 'true');
      setTestEnv('PRIVATE_MODE', 'false');
      assert.throws(() => assertProductionEnvConfig(), /DEMO_PREMIUM/);
    });

    it('rejects PRIVATE_MODE not false', () => {
      setTestEnv('DEMO_PREMIUM', 'false');
      setTestEnv('PRIVATE_MODE', 'true');
      assert.throws(() => assertProductionEnvConfig(), /PRIVATE_MODE/);
    });

    it('passes with required production env', () => {
      setTestEnv('DEMO_PREMIUM', 'false');
      setTestEnv('PRIVATE_MODE', 'false');
      setTestEnv('YOUTH_CONSENT_SECRET', 'x');
      setTestEnv('NUDGE_SECRET', 'x');
      setTestEnv('SUPABASE_SERVICE_ROLE_KEY', 'x');
      setTestEnv('STRIPE_WEBHOOK_SECRET', 'x');
      setTestEnv('PRIVATE_ACCESS_SECRET', 'x');
      assert.doesNotThrow(() => assertProductionEnvConfig());
    });
  });
});
