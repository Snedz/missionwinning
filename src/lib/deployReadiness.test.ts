import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertDeployReady,
  assertProductionEnvConfig,
  getDeployReadinessReport,
  validateBuildLabel,
  warnLaunchEmailAndSiteUrl,
} from '@/lib/deployReadiness';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv.ts';

describe('deployReadiness', () => {
  it('validates build label format', () => {
    assert.equal(validateBuildLabel('2025.06-unified.22'), true);
    assert.equal(validateBuildLabel('bad'), false);
  });

  it('report includes locale export plan', () => {
    const r = getDeployReadinessReport();
    // `.240` 28→29 with `firstSteps`; `.241` 29→30 with `zeroState` (435→450);
    // `.243` 30→31 with `notification` (450→465). Pinned rather than derived on
    // purpose: a namespace silently dropping out of the export plan is how a
    // language loses a screen, and a test that recomputed the number from the
    // same manifest could not see it.
    assert.equal(r.localeFiles, 465);
    assert.equal(r.localeNamespaces, 31);
    assert.ok(r.minTodayKeys >= 100);
    assert.equal(r.target, 'ci');
  });

  it('assertDeployReady passes on integration branch', () => {
    assert.doesNotThrow(() => assertDeployReady());
  });

  it('warnLaunchEmailAndSiteUrl warns on test sender and missing site URL', () => {
    const snap = snapshotEnv();
    try {
      setTestEnv('NODE_ENV', 'production');
      setTestEnv('RESEND_FROM', 'Mission Winning <onboarding@resend.dev>');
      setTestEnv('NEXT_PUBLIC_SITE_URL', '');
      const w = warnLaunchEmailAndSiteUrl();
      assert.ok(w.some((m) => m.includes('resend.dev')));
      assert.ok(w.some((m) => m.includes('SITE_URL')));
    } finally {
      restoreEnv(snap);
    }
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
