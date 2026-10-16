/**
 * Landing free-beta mute — FAQ UI already dropped Super Bundle; JSON-LD must match.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('Landing FAQ UI and JSON-LD share the free-beta filter', () => {
  const src = readFileSync(join(root, 'src/page-components/LandingPage.tsx'), 'utf8');
  assert.match(src, /landingFaqKeysForSurface/);
});

test('faqPageJsonLd + landing locales filter Super Bundle FAQ under free beta', () => {
  const seo = readFileSync(join(root, 'src/lib/publicSeo.ts'), 'utf8');
  assert.match(seo, /landingFaqKeysForSurface/);
  const locales = readFileSync(join(root, 'src/i18n/landingLocales.ts'), 'utf8');
  assert.match(locales, /landingFaqKeysForSurface/);
  assert.match(locales, /isFreeBeta/);
  assert.match(locales, /landingFaqBundleQ/);
});
