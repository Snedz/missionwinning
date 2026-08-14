/**
 * Preview walk P0-2: Super Bundle "get notified until Stripe" must have a
 * real email form on the public landing. `/private` always redirects when
 * the gate is off, so that page cannot be the only capture point.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('LandingPage mounts LaunchNotifyForm (not a third primary-action)', () => {
  const src = read('src/page-components/LandingPage.tsx');
  assert.match(src, /LaunchNotifyForm/, 'landing must mount the notify form');
  assert.match(src, /landing-super-bundle-notify/, 'uses the Super Bundle notify source');
  assert.match(src, /data-mw-landing-notify/, 'band is findable for tests');
  const primaries = src.match(/primary-action/g) || [];
  assert.equal(
    primaries.length,
    2,
    'first-90 counts exactly two red actions on / — notify must not be a third'
  );
});

test('LaunchNotifyForm collects email via submitLead and never opens checkout', () => {
  const src = read('src/components/public/LaunchNotifyForm.tsx');
  assert.match(src, /submitLead/, 'existing leads path — do not invent a second backend');
  assert.match(src, /type="email"/, 'real email field');
  assert.match(src, /type="submit"/, 'real submit');
  assert.doesNotMatch(
    src,
    /createCheckoutForPlan|getStripeCheckoutUrl|\/api\/checkout|stripe\.com/,
    'notify must not open checkout or claim Stripe is live'
  );
  assert.doesNotMatch(src, /primary-action/, 'landing submit is not the page red');
  assert.doesNotMatch(
    src,
    /\b\d{2,}\s+(people|testers|waiting|joined)\b/i,
    'do not invent waitlist traction numbers'
  );
});

test('PrivateTeaserClient still uses the shared notify form', () => {
  const src = read('app/private/PrivateTeaserClient.tsx');
  assert.match(src, /LaunchNotifyForm/, 'gated prod still captures leads');
  assert.match(src, /launch-waitlist/, 'private gate keeps its source');
  assert.doesNotMatch(
    src,
    /handleWaitlist|submitLead/,
    'waitlist logic lives in the shared form — a second copy will drift'
  );
});

test('UnlockButton stays muted in free-beta (checkout, not this form)', () => {
  const src = read('src/components/UnlockButton.tsx');
  assert.match(src, /if\s*\(\s*isFreeBeta\s*\(\s*\)\s*\)\s*return\s*null/);
});
