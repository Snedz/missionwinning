import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isPublicApiPathWhileGated,
  isPublicPathWhileGated,
  queryGrantsAccess,
} from './privateGate.ts';
import { restoreEnv, setTestEnv, snapshotEnv } from './testEnv.ts';

describe('isPublicPathWhileGated', () => {
  it('allows the gate page and legal footer routes', () => {
    assert.equal(isPublicPathWhileGated('/private'), true);
    assert.equal(isPublicPathWhileGated('/privacy'), true);
    assert.equal(isPublicPathWhileGated('/terms'), true);
    assert.equal(isPublicPathWhileGated('/dmca'), true);
    assert.equal(isPublicPathWhileGated('/refunds'), true);
    assert.equal(isPublicPathWhileGated('/about'), true);
    assert.equal(isPublicPathWhileGated('/changelog'), true);
    assert.equal(isPublicPathWhileGated('/america'), true);
    assert.equal(isPublicPathWhileGated('/auth/callback'), true);
  });

  it('allows SEO / conversion surfaces while gated (I-Day, magazine, locales)', () => {
    assert.equal(isPublicPathWhileGated('/welcome'), true);
    assert.equal(isPublicPathWhileGated('/magazine/beyond-the-basics.pdf'), true);
    assert.equal(isPublicPathWhileGated('/locales/en/common.json'), true);
    assert.equal(isPublicPathWhileGated('/locales/es/gate.json'), true);
  });

  it('blocks app routes; beta and feedback stay public', () => {
    assert.equal(isPublicPathWhileGated('/'), false);
    assert.equal(isPublicPathWhileGated('/beta'), true);
    assert.equal(isPublicPathWhileGated('/feedback'), true);
    assert.equal(isPublicPathWhileGated('/today'), false);
    assert.equal(isPublicPathWhileGated('/notify'), true);
    assert.equal(isPublicPathWhileGated('/log'), true);
    assert.equal(isPublicPathWhileGated('/active'), true);
    assert.equal(isPublicPathWhileGated('/active/'), true);
  });
});

describe('isPublicApiPathWhileGated', () => {
  it('allows only gate and webhook endpoints', () => {
    assert.equal(isPublicApiPathWhileGated('/api/private-access'), true);
    assert.equal(isPublicApiPathWhileGated('/api/geo'), true);
    assert.equal(isPublicApiPathWhileGated('/api/private-access/session'), true);
    assert.equal(isPublicApiPathWhileGated('/api/stripe-webhook'), true);
    assert.equal(isPublicApiPathWhileGated('/api/paypal-webhook'), true);
  });

  it('blocks app APIs until the gate cookie is set', () => {
    assert.equal(isPublicApiPathWhileGated('/api/premium/recipes'), false);
    assert.equal(isPublicApiPathWhileGated('/api/beta/metrics'), false);
    assert.equal(isPublicApiPathWhileGated('/api/coach/daily-insight'), false);
  });

  it('allows self-authenticating public routes while gated', () => {
    // /api/leads powers the public waitlist on /private (rate-limited, validated);
    // cron + unsubscribe carry their own auth (CRON_SECRET bearer / HMAC token).
    assert.equal(isPublicApiPathWhileGated('/api/leads'), true);
    assert.equal(isPublicApiPathWhileGated('/api/cron/nudges'), true);
    assert.equal(isPublicApiPathWhileGated('/api/cron/weekly-digest'), true);
    assert.equal(isPublicApiPathWhileGated('/api/crypto-checkout/intent'), true);
    assert.equal(isPublicApiPathWhileGated('/api/crypto-checkout/confirm'), true);
    assert.equal(isPublicApiPathWhileGated('/api/nudges/unsubscribe'), true);
    // Anonymous premium status probe (premium:false) — no auth required
    assert.equal(isPublicApiPathWhileGated('/api/premium/status'), true);
    assert.equal(isPublicApiPathWhileGated('/api/health'), true);
    assert.equal(isPublicApiPathWhileGated('/api/beta/invites/landed'), true);
  });

  it('does not allowlist mobile or premium catalogs (Bearer/cookie at gate instead)', () => {
    assert.equal(isPublicApiPathWhileGated('/api/mobile/workouts'), false);
    assert.equal(isPublicApiPathWhileGated('/api/mobile/sync/workouts'), false);
    assert.equal(isPublicApiPathWhileGated('/api/premium/recipes'), false);
    assert.equal(isPublicApiPathWhileGated('/api/premium/mind'), false);
  });

  it('PUBLIC_API_PATHS_WHILE_GATED is an intentional frozen set', async () => {
    const { PUBLIC_API_PATHS_WHILE_GATED } = await import('./privateGate.ts');
    assert.deepEqual(
      [...PUBLIC_API_PATHS_WHILE_GATED].sort(),
      [
        '/api/beta/invites/landed',
        '/api/cron/day-review',
        '/api/cron/nudges',
        '/api/cron/weekly-digest',
        '/api/cron/wind-down',
        '/api/crypto-checkout',
        '/api/geo',
        '/api/health',
        '/api/leads',
        '/api/leads/unsubscribe',
        '/api/nudges/unsubscribe',
        '/api/paypal-webhook',
        '/api/premium/status',
        '/api/private-access',
        '/api/stripe-webhook',
      ].sort()
    );
  });
});

describe('queryGrantsAccess', () => {
  let envSnapshot: NodeJS.ProcessEnv;

  beforeEach(() => {
    envSnapshot = snapshotEnv();
  });

  afterEach(() => {
    restoreEnv(envSnapshot);
  });

  it('does not grant from a query string in production', () => {
    setTestEnv('NODE_ENV', 'production');
    setTestEnv('PRIVATE_ALLOW_QUERY_ACCESS', undefined);
    const params = new URLSearchParams({ access: 'test-gate-secret-32chars-min!!' });
    assert.equal(queryGrantsAccess(params, 'test-gate-secret-32chars-min!!'), false);
  });

  it('does not grant from invite or next params', () => {
    setTestEnv('NODE_ENV', 'test');
    setTestEnv('PRIVATE_ALLOW_QUERY_ACCESS', 'true');
    assert.equal(
      queryGrantsAccess(new URLSearchParams({ invite: 'MW-B-ABC12' }), 'test-gate-secret-32chars-min!!'),
      false
    );
    assert.equal(
      queryGrantsAccess(new URLSearchParams({ next: '/log' }), 'test-gate-secret-32chars-min!!'),
      false
    );
  });

  it('still requires the flag on Vercel production even if NODE_ENV is unset-like', () => {
    setTestEnv('NODE_ENV', 'test');
    setTestEnv('VERCEL_ENV', 'production');
    setTestEnv('PRIVATE_ALLOW_QUERY_ACCESS', undefined);
    const params = new URLSearchParams({ access: 'test-gate-secret-32chars-min!!' });
    assert.equal(queryGrantsAccess(params, 'test-gate-secret-32chars-min!!'), false);
  });
});
