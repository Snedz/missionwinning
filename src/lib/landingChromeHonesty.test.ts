/**
 * G2 — landing chrome honesty after Done.
 *
 * MarketingNav sits on the `.696` homepage. Its status bar first-painted
 * "Open beta — Super Bundle: get notified until Stripe" while the product
 * stamp is Alpha 0.1.0 and the English pack is open alpha. First paint
 * and hydrate must say the same sentence.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('landing status bar is Alpha, not leftover Open beta / Stripe merch', () => {
  const nav = read('src/components/marketing/MarketingNav.tsx');
  assert.match(nav, /productVersion:\s*APP_PUBLIC_PRODUCT_VERSION/);
  assert.match(nav, /defaultValue:\s*APP_PUBLIC_STATUS_LINE_EN/);
  assert.doesNotMatch(nav, /Open beta/);
  assert.doesNotMatch(nav, /get notified until Stripe/);
  assert.doesNotMatch(nav, /Free-beta|free-beta/i);
});

test('PublicStatusBar fallback stamp is the same Alpha line', () => {
  const bar = read('src/components/public/PublicStatusBar.tsx');
  assert.match(bar, /APP_PUBLIC_STATUS_LINE_EN/);
  assert.match(bar, /isFreeBeta\(\)/);
});
