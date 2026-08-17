/**
 * Production smoke ratchet — privacy/terms English floors + retired /compare.
 *
 * Live prod on `.618` painted raw `infoPrivacy*` / `infoTerms*` and served
 * set-table at `/compare` (200). Tip already has floors (`.653`) and the
 * permanent redirect (`.668`); this file fails CI if either disappears.
 *
 * Discover keys from the page sources (no closed allowlist of section titles)
 * and parse redirects from `next.config.js` (source shape, not one spelling).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { infoEnFloor } from '@/i18n/infoEnFloor';

const root = join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

/** Keys referenced in Privacy/Terms section tables (key / bodyKey / listKeys). */
function infoKeysFromPage(src: string): string[] {
  const keys = new Set<string>();
  for (const m of src.matchAll(/'(info(?:Privacy|Terms)[A-Za-z0-9]+)'/g)) {
    keys.add(m[1]!);
  }
  return [...keys].sort();
}

test('infoEnFloor floors Privacy and Terms keys to English (never the raw key)', () => {
  const privacyKeys = infoKeysFromPage(read('src/page-components/PrivacyPage.tsx'));
  const termsKeys = infoKeysFromPage(read('src/page-components/TermsPage.tsx'));
  assert.ok(privacyKeys.length >= 10, 'PrivacyPage must declare infoPrivacy* keys');
  assert.ok(termsKeys.length >= 10, 'TermsPage must declare infoTerms* keys');

  for (const key of [...privacyKeys, ...termsKeys]) {
    const floor = infoEnFloor(key);
    assert.notEqual(
      floor,
      key,
      `${key} must have an English floor — raw key paint is the .618 prod defect`
    );
    assert.ok(floor.trim().length > 0, `${key} floor must be non-empty`);
  }

  // Named samples from the live smoke failure (visible jump-link / body paint).
  assert.equal(infoEnFloor('infoPrivacyOverview'), 'Overview');
  assert.notEqual(infoEnFloor('infoPrivacyOverviewBody'), 'infoPrivacyOverviewBody');
  assert.equal(infoEnFloor('infoTermsAgreement'), 'Agreement');
  assert.notEqual(infoEnFloor('infoTermsAgreementBody'), 'infoTermsAgreementBody');
});

test('Privacy and Terms pages wire infoEnFloor into every t() defaultValue path', () => {
  for (const rel of ['src/page-components/PrivacyPage.tsx', 'src/page-components/TermsPage.tsx']) {
    const src = read(rel);
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    assert.match(src, /infoEnFloor/, `${rel} missing infoEnFloor import/use`);
    assert.doesNotMatch(code, /defaultValue:\s*section\.key/);
    assert.doesNotMatch(code, /defaultValue:\s*section\.bodyKey/);
    assert.doesNotMatch(code, /defaultValue:\s*liKey\b/);
    assert.doesNotMatch(code, /defaultValue:\s*s\.key\b/);
    // Floor must be the defaultValue expression, not a leftover raw key string.
    assert.match(
      code,
      /defaultValue:\s*infoEnFloor\(/,
      `${rel} must pass infoEnFloor(...) as defaultValue`
    );
  }
});

test('next.config permanently redirects /compare and /compare/* to /welcome', () => {
  const cfg = read('next.config.js')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

  assert.match(cfg, /async\s+redirects\s*\(/, 'redirects() must exist');

  const block = /async\s+redirects\s*\(\s*\)\s*\{([\s\S]*?)\n\s*\}/.exec(cfg)?.[1] ?? '';
  assert.ok(block.length > 0, 'could not parse redirects() body');

  const rules = [...block.matchAll(/\{\s*source:\s*'([^']+)'\s*,\s*destination:\s*'([^']+)'\s*,\s*permanent:\s*(true|false)\s*\}/g)];
  assert.ok(rules.length >= 2, 'expected at least /compare and /compare/:path* rules');

  const bySource = new Map(rules.map((m) => [m[1]!, { dest: m[2]!, permanent: m[3] === 'true' }]));

  for (const source of ['/compare', '/compare/:path*']) {
    const rule = bySource.get(source);
    assert.ok(rule, `missing redirect rule for ${source}`);
    assert.equal(rule!.dest, '/welcome', `${source} must redirect to /welcome`);
    assert.equal(rule!.permanent, true, `${source} must be permanent (301/308)`);
  }

  // Route index must keep documenting the retirement (not a live ComparePage).
  assert.match(
    read('app/INDEX.md'),
    /\/compare.*(?:[Rr]emoved|redirect)/s,
    'app/INDEX.md must keep /compare documented as removed/redirect'
  );
});