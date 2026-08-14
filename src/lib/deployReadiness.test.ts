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
    // `.243` 30→31 with `notification` (450→465). `.281` 31→32 with `whatsNew`
    // (465→480). 32→33 with `rewards` (480→495): the rewards surface shipped in
    // `.505`–`.543` and its pack never landed, so 17 keys resolved to no
    // catalogue and rendered English in all 15 languages — this assertion is
    // what a namespace *arriving* looks like. Pinned rather than derived on
    // purpose: a namespace silently dropping out of the export plan is how a
    // language loses a screen, and a test that recomputed the number from the
    // same manifest could not see it. `.606` 33→34 with `athlete` (495→510) for
    // the Account/You split — and the same ship found the *rewards* pack had a
    // second hole this counter cannot see: `rewards` was in the export plan, so
    // this number was right, while 26 badge and rank keys emitted from
    // `catalog.ts` were defined in no catalogue at all and survived only in a
    // stale committed export. Counting namespaces proves a pack ships; only
    // `rewardsKeyParity.test.ts` proves the pack is complete.
    // `.742` 34→35 with `places` (510→525): Explore pin-board + place-dex.
    // `.766` 35→36 with `server` messenger (525→540).
    assert.equal(r.localeFiles, 540);
    assert.equal(r.localeNamespaces, 36);
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
