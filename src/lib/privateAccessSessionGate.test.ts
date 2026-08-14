import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bearerFromAuthorization, sessionMintGate } from './privateAccessSessionGate.ts';

const SECRET = 'test-gate-secret-32chars-min!!';

function headers(country: string | null): { get(name: string): string | null } {
  return {
    get(name) {
      if (country && name === 'cf-ipcountry') return country;
      return null;
    },
  };
}

describe('sessionMintGate', () => {
  it('unauthenticated mint fails', () => {
    const denied = sessionMintGate({
      secret: SECRET,
      bearer: '',
      headers: headers(null),
    });
    assert.equal(denied.ok, false);
    if (!denied.ok) {
      assert.equal(denied.status, 401);
    }
  });

  it('blocked ISO is denied', () => {
    const denied = sessionMintGate({
      secret: SECRET,
      bearer: 'session-token',
      headers: headers('DE'),
    });
    assert.equal(denied.ok, false);
    if (!denied.ok) {
      assert.equal(denied.status, 403);
      assert.equal(denied.body.code, 'territory_blocked');
      assert.equal(denied.body.reason, 'europe');
    }
  });

  it('missing country (local / no CDN) is allowed through to getUser', () => {
    const allowed = sessionMintGate({
      secret: SECRET,
      bearer: 'session-token',
      headers: headers(null),
    });
    assert.equal(allowed.ok, true);
  });

  it('supported ISO is allowed through to getUser', () => {
    const allowed = sessionMintGate({
      secret: SECRET,
      bearer: 'session-token',
      headers: headers('US'),
    });
    assert.equal(allowed.ok, true);
  });

  it('missing secret fails closed', () => {
    const denied = sessionMintGate({
      secret: undefined,
      bearer: 'session-token',
      headers: headers('US'),
    });
    assert.equal(denied.ok, false);
    if (!denied.ok) assert.equal(denied.status, 500);
  });
});

describe('bearerFromAuthorization', () => {
  it('reads a Bearer token and ignores a missing header', () => {
    assert.equal(bearerFromAuthorization('Bearer abc'), 'abc');
    assert.equal(bearerFromAuthorization(null), '');
    assert.equal(bearerFromAuthorization('Basic abc'), '');
  });
});
