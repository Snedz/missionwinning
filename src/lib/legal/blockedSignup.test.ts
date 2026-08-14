/**
 * P1-3 — a blocked-region signup may be reaped only when it is new and empty.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BLOCKED_SIGNUP_OWNED_TABLES,
  BLOCKED_SIGNUP_REAP_WINDOW_MS,
  blockedSignupDisposition,
} from './blockedSignup.ts';

const now = 1_700_000_000_000;

describe('blockedSignupDisposition', () => {
  it('reaps a brand-new account with no product rows', () => {
    assert.equal(
      blockedSignupDisposition({
        createdAt: new Date(now - 60_000).toISOString(),
        hasOwnedRows: false,
        nowMs: now,
      }),
      'reap'
    );
  });

  it('refuses an existing account even with no product rows', () => {
    assert.equal(
      blockedSignupDisposition({
        createdAt: new Date(now - BLOCKED_SIGNUP_REAP_WINDOW_MS - 1).toISOString(),
        hasOwnedRows: false,
        nowMs: now,
      }),
      'refuse'
    );
  });

  it('refuses a new account that already has product rows', () => {
    assert.equal(
      blockedSignupDisposition({
        createdAt: new Date(now - 60_000).toISOString(),
        hasOwnedRows: true,
        nowMs: now,
      }),
      'refuse'
    );
  });

  it('refuses when created_at or owned-row lookup is unknown', () => {
    assert.equal(
      blockedSignupDisposition({ createdAt: null, hasOwnedRows: false, nowMs: now }),
      'refuse'
    );
    assert.equal(
      blockedSignupDisposition({
        createdAt: new Date(now - 60_000).toISOString(),
        hasOwnedRows: false,
        unknownOwnedRows: true,
        nowMs: now,
      }),
      'refuse'
    );
  });

  it('owned-row tables do not include auto-created profiles', () => {
    assert.ok(!BLOCKED_SIGNUP_OWNED_TABLES.includes('profiles' as never));
    assert.ok(BLOCKED_SIGNUP_OWNED_TABLES.includes('workout_logs'));
  });
});

describe('auth callback wiring', () => {
  it('identifies the user then refuses cookies before mint', () => {
    const src = readFileSync(join(import.meta.dirname, '../../../app/auth/callback/route.ts'), 'utf8');
    const exchangeAt = src.indexOf('exchangeCodeForSession');
    const territoryAt = src.indexOf('hostedServiceAccessFromHeaders(request.headers)');
    const disposeAt = src.indexOf('disposeBlockedTerritorySignup(admin, user)');
    const attachAt = src.indexOf('attachPrivateAccessCookie(response.cookies');
    assert.ok(exchangeAt >= 0 && territoryAt >= 0 && disposeAt >= 0 && attachAt >= 0);
    assert.ok(exchangeAt < territoryAt, 'must exchange before territory so the user can be identified');
    assert.ok(territoryAt < disposeAt, 'blocked path must dispose after the territory check');
    assert.ok(disposeAt < attachAt, 'must not mint the gate cookie before dispose');
    assert.match(src, /maxAge:\s*0/);
  });
});
