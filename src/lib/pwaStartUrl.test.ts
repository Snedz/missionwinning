/**
 * Gated production must cold-start the invite teaser. Ungated (public flip,
 * Preview, `npm run gate` with PRIVATE_MODE=false) must cold-start Today.
 *
 * Falsified by returning `/private` when PRIVATE_MODE=false, or `/active`
 * when ungated (logger is gate-public; it is not the install home).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isPrivateGatePublicPath } from '@/lib/publicRoutes';
import {
  PWA_ID,
  PWA_START_GATED,
  PWA_START_PUBLIC,
  pwaStartUrl,
} from './pwaStartUrl.ts';

describe('pwaStartUrl', () => {
  it('production + PRIVATE_MODE on → /private (invite cold install)', () => {
    assert.equal(
      pwaStartUrl({
        PRIVATE_MODE: 'true',
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
      }),
      PWA_START_GATED
    );
    assert.equal(
      pwaStartUrl({
        PRIVATE_MODE: '1',
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
      }),
      PWA_START_GATED
    );
  });

  it('production + PRIVATE_MODE unset → /private (default on in production)', () => {
    const url = pwaStartUrl({
      NODE_ENV: 'production',
      VERCEL_ENV: 'production',
    });
    assert.equal(url, PWA_START_GATED);
    assert.ok(isPrivateGatePublicPath(url));
  });

  it('PRIVATE_MODE=false → /log (public flip / gate build)', () => {
    assert.equal(
      pwaStartUrl({
        PRIVATE_MODE: 'false',
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
      }),
      PWA_START_PUBLIC
    );
  });

  it('preview → /log even when PRIVATE_MODE is on (inherited Production env)', () => {
    assert.equal(
      pwaStartUrl({
        PRIVATE_MODE: 'true',
        NODE_ENV: 'production',
        VERCEL_ENV: 'preview',
      }),
      PWA_START_PUBLIC
    );
  });

  it('local next dev → /log unless PRIVATE_MODE is explicitly true', () => {
    assert.equal(pwaStartUrl({ NODE_ENV: 'development' }), PWA_START_PUBLIC);
    assert.equal(
      pwaStartUrl({ PRIVATE_MODE: 'true', NODE_ENV: 'development' }),
      PWA_START_GATED
    );
  });

  it('ungated start_url is Today, never the logger or the SEO root', () => {
    const url = pwaStartUrl({
      PRIVATE_MODE: 'false',
      NODE_ENV: 'production',
      VERCEL_ENV: 'production',
    });
    assert.equal(url, '/log');
    assert.notEqual(url, '/active');
    assert.notEqual(url, '/');
    assert.equal(PWA_ID, '/log');
  });
});
