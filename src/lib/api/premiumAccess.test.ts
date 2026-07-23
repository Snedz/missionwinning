import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePremiumContentGate } from '@/lib/api/premiumAccess';

describe('resolvePremiumContentGate', () => {
  it('allows demo premium without session', () => {
    const r = resolvePremiumContentGate({
      demoPremium: true,
      supabaseConfigured: false,
      hasAccessToken: false,
      userPresent: false,
      isPremium: false,
    });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.mode, 'demo');
  });

  it('allows free beta without session', () => {
    const r = resolvePremiumContentGate({
      demoPremium: false,
      freeBeta: true,
      supabaseConfigured: true,
      hasAccessToken: false,
      userPresent: false,
      isPremium: false,
    });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.mode, 'free_beta');
  });

  it('returns 403 without access token when Supabase configured', () => {
    const r = resolvePremiumContentGate({
      demoPremium: false,
      supabaseConfigured: true,
      hasAccessToken: false,
      userPresent: false,
      isPremium: false,
    });
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 403);
  });

  it('returns 401 with token but no user', () => {
    const r = resolvePremiumContentGate({
      demoPremium: false,
      supabaseConfigured: true,
      hasAccessToken: true,
      userPresent: false,
      isPremium: false,
    });
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 401);
  });

  it('returns 403 for signed-in user without enrollment', () => {
    const r = resolvePremiumContentGate({
      demoPremium: false,
      supabaseConfigured: true,
      hasAccessToken: true,
      userPresent: true,
      isPremium: false,
    });
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 403);
  });

  it('allows enrolled premium user', () => {
    const r = resolvePremiumContentGate({
      demoPremium: false,
      supabaseConfigured: true,
      hasAccessToken: true,
      userPresent: true,
      isPremium: true,
    });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.mode, 'enrolled');
  });
});
