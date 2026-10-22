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
  assert.match(src, /from '@\/i18n\/landingSurface'/);
  assert.match(src, /landingFaqKeysForSurface/);
  assert.doesNotMatch(src, /from '@\/i18n\/landingLocales'/);
});

test('faqPageJsonLd + landing surface filter Super Bundle FAQ under free beta', () => {
  const seo = readFileSync(join(root, 'src/lib/publicSeo.ts'), 'utf8');
  assert.match(seo, /landingFaqKeysForSurface/);
  const surface = readFileSync(join(root, 'src/i18n/landingSurface.ts'), 'utf8');
  assert.match(surface, /function landingFaqKeysForSurface/);
  assert.match(surface, /isFreeBeta/);
  assert.match(surface, /landingFaqBundleQ/);
  const locales = readFileSync(join(root, 'src/i18n/landingLocales.ts'), 'utf8');
  assert.match(locales, /landingFaqKeysForSurface/);
  assert.match(locales, /from '@\/i18n\/landingSurface'/);
  assert.doesNotMatch(locales, /function landingFaqKeysForSurface/);
});
