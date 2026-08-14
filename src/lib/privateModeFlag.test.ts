/**
 * E-Day (`.728`): Preview is ungated; production with PRIVATE_MODE on stays gated.
 *
 * Falsified by deleting the `VERCEL_ENV === 'preview'` short-circuit: preview
 * cases go gated while production cases still pass — which is how www stayed
 * locked when Preview inherited Production env.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isPrivateModeEnabledFromEnv } from './privateModeFlag.ts';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('isPrivateModeEnabledFromEnv', () => {
  it('production + PRIVATE_MODE on → gated', () => {
    assert.equal(
      isPrivateModeEnabledFromEnv({
        PRIVATE_MODE: 'true',
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
      }),
      true
    );
    assert.equal(
      isPrivateModeEnabledFromEnv({
        PRIVATE_MODE: '1',
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
      }),
      true
    );
  });

  it('production + PRIVATE_MODE unset → gated (default on in production)', () => {
    assert.equal(
      isPrivateModeEnabledFromEnv({
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
      }),
      true
    );
  });

  it('preview → ungated even when PRIVATE_MODE is on (inherited Production env)', () => {
    assert.equal(
      isPrivateModeEnabledFromEnv({
        PRIVATE_MODE: 'true',
        NODE_ENV: 'production',
        VERCEL_ENV: 'preview',
      }),
      false
    );
    assert.equal(
      isPrivateModeEnabledFromEnv({
        NODE_ENV: 'production',
        VERCEL_ENV: 'preview',
      }),
      false
    );
  });

  it('local next dev is ungated unless PRIVATE_MODE is explicitly true', () => {
    assert.equal(
      isPrivateModeEnabledFromEnv({ NODE_ENV: 'development' }),
      false,
      'npm run dev: NODE_ENV=development, VERCEL_ENV unset → ungated'
    );
    assert.equal(
      isPrivateModeEnabledFromEnv({
        PRIVATE_MODE: 'true',
        NODE_ENV: 'development',
      }),
      true,
      'explicit PRIVATE_MODE=true still gates local (docs/ENV.md)'
    );
    assert.equal(
      isPrivateModeEnabledFromEnv({
        PRIVATE_MODE: 'false',
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
      }),
      false
    );
  });
});

describe('mirrors stay on the same Preview short-circuit', () => {
  it('next.config.js privateGateActive treats VERCEL_ENV preview as off before PRIVATE_MODE', () => {
    const cfg = read('next.config.js');
    const start = cfg.indexOf('const privateGateActive');
    assert.notEqual(start, -1, 'next.config.js must define privateGateActive');
    const body = cfg.slice(start, start + 480);
    assert.match(
      body,
      /VERCEL_ENV\s*===\s*['"]preview['"]/,
      'Preview inherit of PRIVATE_MODE=true must not keep the client gate on'
    );
    const previewAt = body.search(/VERCEL_ENV\s*===\s*['"]preview['"]/);
    const modeAt = body.search(/PRIVATE_MODE/);
    assert.ok(
      previewAt !== -1 && modeAt !== -1 && previewAt < modeAt,
      'VERCEL_ENV preview must be checked before PRIVATE_MODE — Preview inherits true'
    );
  });

  it('sitemap uses the shared predicate (no third private copy)', () => {
    const src = read('app/sitemap.ts');
    assert.match(src, /from ['"]@\/lib\/privateModeFlag['"]/);
    assert.doesNotMatch(
      src,
      /function privateGateOn/,
      'sitemap must not keep a private copy of the gate predicate (.178)'
    );
  });

  it('PWA start_url uses the shared predicate via pwaStartUrl', () => {
    const helper = read('src/lib/pwaStartUrl.ts');
    assert.match(helper, /isPrivateModeEnabledFromEnv/);
    const manifest = read('app/manifest.ts');
    assert.match(manifest, /from ['"]@\/lib\/pwaStartUrl['"]/);
    assert.doesNotMatch(
      manifest,
      /start_url:\s*['"]\/private['"]/,
      'manifest must not hardcode gated start_url — SW already flag-switches'
    );
  });
});
