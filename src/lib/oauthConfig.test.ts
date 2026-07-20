import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';
import {
  formatEnabledOAuthLabels,
  formatOAuthError,
  getEnabledOAuthProviders,
  isAppleOAuthEnabled,
  isAzureOAuthEnabled,
  isFacebookOAuthEnabled,
  isGoogleOAuthEnabled,
} from './oauthConfig';

const ENV_KEYS = [
  'NEXT_PUBLIC_OAUTH_GOOGLE',
  'NEXT_PUBLIC_OAUTH_APPLE',
  'NEXT_PUBLIC_OAUTH_AZURE',
  'NEXT_PUBLIC_OAUTH_FACEBOOK',
] as const;

describe('oauthConfig', () => {
  const saved: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const v = saved[key];
      if (v === undefined) delete process.env[key];
      else process.env[key] = v;
    }
  });

  it('shows Google by default; Apple/Azure/Facebook off', () => {
    assert.equal(isGoogleOAuthEnabled(), true);
    assert.equal(isAppleOAuthEnabled(), false);
    assert.equal(isAzureOAuthEnabled(), false);
    assert.equal(isFacebookOAuthEnabled(), false);
    assert.deepEqual(getEnabledOAuthProviders(), ['google']);
  });

  it('hides Google when NEXT_PUBLIC_OAUTH_GOOGLE=false', () => {
    process.env.NEXT_PUBLIC_OAUTH_GOOGLE = 'false';
    assert.equal(isGoogleOAuthEnabled(), false);
    assert.deepEqual(getEnabledOAuthProviders(), []);
  });

  it('enables Apple, Azure, Facebook when flags are true', () => {
    process.env.NEXT_PUBLIC_OAUTH_APPLE = 'true';
    process.env.NEXT_PUBLIC_OAUTH_AZURE = 'true';
    process.env.NEXT_PUBLIC_OAUTH_FACEBOOK = 'true';
    assert.deepEqual(getEnabledOAuthProviders(), [
      'apple',
      'google',
      'azure',
      'facebook',
    ]);
  });

  it('formats labels and provider-disabled errors', () => {
    assert.equal(formatEnabledOAuthLabels(['google']), 'Google');
    assert.equal(formatEnabledOAuthLabels(['apple', 'google']), 'Apple or Google');
    assert.equal(
      formatEnabledOAuthLabels(['apple', 'google', 'azure']),
      'Apple, Google, or Microsoft'
    );
    assert.match(
      formatOAuthError('Unsupported provider: provider is not enabled'),
      /isn’t available yet/
    );
    assert.equal(formatOAuthError('Network error'), 'Network error');
  });
});
