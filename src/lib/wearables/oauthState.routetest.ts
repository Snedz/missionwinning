/**
 * P2-4 — wearables OAuth state is not signed with a source fallback,
 * and redirect_uri is not the request Host.
 */
import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  WearablesOAuthMisconfiguredError,
  getOAuthRedirectUri,
  signOAuthState,
  verifyOAuthState,
} from './oauthState.ts';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv.ts';

describe('oauthState', () => {
  let envSnapshot: NodeJS.ProcessEnv;

  beforeEach(() => {
    envSnapshot = snapshotEnv();
    delete process.env.WEARABLES_OAUTH_STATE_SECRET;
    delete process.env.PRIVATE_ACCESS_SECRET;
    delete process.env.NUDGE_SECRET;
    delete process.env.WEARABLES_OAUTH_REDIRECT_BASE;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    restoreEnv(envSnapshot);
  });

  it('round-trips state with a dedicated secret', () => {
    setTestEnv('WEARABLES_OAUTH_STATE_SECRET', 'dedicated-secret');
    const token = signOAuthState({
      userId: 'user-1',
      provider: 'strava',
      exp: Date.now() + 60_000,
    });
    const verified = verifyOAuthState(token);
    assert.equal(verified.ok, true);
    if (verified.ok) {
      assert.equal(verified.userId, 'user-1');
      assert.equal(verified.provider, 'strava');
    }
  });

  it('throws in production when the dedicated secret is missing', () => {
    setTestEnv('NODE_ENV', 'production');
    setTestEnv('PRIVATE_ACCESS_SECRET', 'gate-secret');
    setTestEnv('NUDGE_SECRET', 'nudge-secret');
    assert.throws(
      () => signOAuthState({ userId: 'u', provider: 'strava', exp: Date.now() + 1000 }),
      WearablesOAuthMisconfiguredError
    );
  });

  it('refuses to sign with no secret even in development', () => {
    setTestEnv('NODE_ENV', 'development');
    assert.throws(
      () => signOAuthState({ userId: 'u', provider: 'strava', exp: Date.now() + 1000 }),
      WearablesOAuthMisconfiguredError
    );
  });

  it('allows PRIVATE_ACCESS_SECRET only outside production', () => {
    setTestEnv('NODE_ENV', 'development');
    setTestEnv('PRIVATE_ACCESS_SECRET', 'dev-gate');
    const token = signOAuthState({
      userId: 'u',
      provider: 'whoop',
      exp: Date.now() + 60_000,
    });
    assert.equal(verifyOAuthState(token).ok, true);
  });

  it('binds redirect_uri to the configured origin, not a request Host', () => {
    setTestEnv('WEARABLES_OAUTH_REDIRECT_BASE', 'https://www.missionwinning.com/extra');
    assert.equal(
      getOAuthRedirectUri('strava'),
      'https://www.missionwinning.com/api/wearables/oauth/strava/callback'
    );
  });

  it('rejects a missing or non-https production redirect base', () => {
    setTestEnv('NODE_ENV', 'production');
    setTestEnv('WEARABLES_OAUTH_STATE_SECRET', 's');
    assert.throws(() => getOAuthRedirectUri('strava'), WearablesOAuthMisconfiguredError);
    setTestEnv('NEXT_PUBLIC_APP_URL', 'http://evil.example');
    assert.throws(() => getOAuthRedirectUri('strava'), WearablesOAuthMisconfiguredError);
    setTestEnv('NEXT_PUBLIC_APP_URL', 'https://www.missionwinning.com');
    assert.equal(
      getOAuthRedirectUri('oura'),
      'https://www.missionwinning.com/api/wearables/oauth/oura/callback'
    );
  });
});

describe('oauthState source', () => {
  it('has no hardcoded HMAC fallback and does not take request origin', () => {
    const src = readFileSync(join(import.meta.dirname, 'oauthState.ts'), 'utf8');
    assert.doesNotMatch(src, /mw-wearables-dev-state/);
    assert.match(src, /WearablesOAuthMisconfiguredError/);
    assert.doesNotMatch(src, /function getOAuthRedirectUri\(requestOrigin/);
    const start = readFileSync(
      join(import.meta.dirname, '../../../app/api/wearables/oauth/[provider]/start/route.ts'),
      'utf8'
    );
    assert.doesNotMatch(start, /getOAuthRedirectUri\(\s*origin/);
    assert.doesNotMatch(start, /req\.nextUrl\.origin/);
  });
});
