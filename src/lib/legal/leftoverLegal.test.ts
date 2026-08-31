/**
 * Legal is the policy, not a legal-index tour.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

const LEGAL_PAGES = [
  ['src/page-components/PrivacyPage.tsx', 'house-privacy'],
  ['src/page-components/CookiesPage.tsx', 'house-cookies'],
  ['src/page-components/TermsPage.tsx', 'house-terms'],
  ['src/page-components/RefundsPage.tsx', 'house-refunds'],
  ['src/page-components/DmcaPage.tsx', 'house-dmca'],
  ['src/page-components/UsagePolicyPage.tsx', 'house-usage'],
  ['src/page-components/SupportedRegionsPage.tsx', 'house-regions'],
  ['src/page-components/ServiceTermsPage.tsx', 'house-service-terms'],
  ['src/page-components/AccessibilityPage.tsx', 'house-a11y'],
] as const;

test('Privacy first paint is jump chips + sections', () => {
  const src = stripComments(read('src/page-components/PrivacyPage.tsx'));
  assert.match(src, /className="house-privacy"/);
  assert.match(src, /PRIVACY_SECTIONS/);
  assert.match(src, /house-privacy-jump/);
  assert.doesNotMatch(src, /showLegalFooter/);
});

test('leftover hops stay off legal rooms', () => {
  for (const [rel, house] of LEGAL_PAGES) {
    const src = stripComments(read(rel));
    assert.match(src, new RegExp(`className="${house}"`), `${rel} lost house mark`);
    assert.doesNotMatch(src, /showLegalFooter/, `${rel} leftover legal footer`);
    assert.doesNotMatch(src, /<details\b/, `${rel} leftover details`);
  }
});

test('Train still does not mint a week; Help still the FAQ; Fuel still the log', () => {
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
  const help = stripComments(read('src/page-components/HelpPage.tsx'));
  assert.match(help, /HELP_FAQ/);
  assert.doesNotMatch(help, /showLegalFooter/);
  const fuel = stripComments(read('src/page-components/NutritionPage.tsx'));
  assert.match(fuel, /data-testid="fuel-log-dock"/);
});
