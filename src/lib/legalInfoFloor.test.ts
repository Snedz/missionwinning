/**
 * Legal pages must floor i18n keys — never paint infoRegionsSummaryBody raw.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { infoEnFloor } from '@/i18n/infoEnFloor';

const root = join(import.meta.dirname, '..', '..');

const LEGAL_PAGES = [
  'src/page-components/TermsPage.tsx',
  'src/page-components/PrivacyPage.tsx',
  'src/page-components/UsagePolicyPage.tsx',
  'src/page-components/SupportedRegionsPage.tsx',
  'src/page-components/ServiceTermsPage.tsx',
  'src/page-components/DmcaPage.tsx',
];

test('infoEnFloor returns English catalog text for region and service keys', () => {
  assert.equal(infoEnFloor('infoRegionsSummary'), 'Summary');
  assert.match(infoEnFloor('infoRegionsSummaryBody'), /hosted consumer service/);
  assert.equal(infoEnFloor('infoServiceScope'), 'Scope');
  assert.notEqual(infoEnFloor('infoServiceScopeBody'), 'infoServiceScopeBody');
});

test('legal pages use infoEnFloor not defaultValue: key', () => {
  for (const rel of LEGAL_PAGES) {
    const src = readFileSync(join(root, rel), 'utf8');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    assert.match(src, /infoEnFloor/, `${rel} missing infoEnFloor`);
    assert.doesNotMatch(code, /defaultValue:\s*section\.key/);
    assert.doesNotMatch(code, /defaultValue:\s*section\.bodyKey/);
    assert.doesNotMatch(code, /defaultValue:\s*liKey\b/);
    assert.doesNotMatch(code, /defaultValue:\s*s\.key\b/);
  }
});
