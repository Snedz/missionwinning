import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  bearerAccessToken,
  extractSupabaseAccessTokenFromRequest,
} from '@/lib/authAccessToken';

function fakeReq(opts: {
  authorization?: string | null;
  cookies?: { name: string; value: string }[];
}) {
  return {
    headers: {
      get(name: string) {
        if (name.toLowerCase() === 'authorization') return opts.authorization ?? null;
        return null;
      },
    },
    cookies: {
      getAll() {
        return opts.cookies ?? [];
      },
    },
  };
}

describe('bearerAccessToken', () => {
  it('returns token for Bearer scheme', () => {
    assert.equal(bearerAccessToken(fakeReq({ authorization: 'Bearer abc.def.ghi' })), 'abc.def.ghi');
  });

  it('is case-insensitive on scheme', () => {
    assert.equal(bearerAccessToken(fakeReq({ authorization: 'bearer xyz' })), 'xyz');
  });

  it('returns null when missing or empty', () => {
    assert.equal(bearerAccessToken(fakeReq({})), null);
    assert.equal(bearerAccessToken(fakeReq({ authorization: 'Bearer ' })), null);
    assert.equal(bearerAccessToken(fakeReq({ authorization: 'Basic x' })), null);
  });
});

describe('extractSupabaseAccessTokenFromRequest', () => {
  it('prefers Bearer over cookies', () => {
    const token = extractSupabaseAccessTokenFromRequest(
      fakeReq({
        authorization: 'Bearer from-header',
        cookies: [{ name: 'sb-x-auth-token', value: 'eyJhbGciOiJIUzI1NiJ9.a.b' }],
      })
    );
    assert.equal(token, 'from-header');
  });

  it('falls back to sb auth cookie JWT', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.payload.sig';
    const token = extractSupabaseAccessTokenFromRequest(
      fakeReq({
        cookies: [{ name: 'sb-abc-auth-token', value: jwt }],
      })
    );
    assert.equal(token, jwt);
  });

  it('returns null when neither present', () => {
    assert.equal(extractSupabaseAccessTokenFromRequest(fakeReq({})), null);
  });
});
