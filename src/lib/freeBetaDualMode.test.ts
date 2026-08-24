/**
 * Free-beta dual mode — mute pay AND unlock depth.
 *
 * Mute half: freeBetaMute.test.ts.
 * Unlock half: while FREE_BETA is on, premium depth must treat athletes as
 * entitled without enrollment. When free-beta is off, that bypass must leave
 * so Stripe enrollment is load-bearing again.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');

const DEPTH_UNLOCK: { file: string; needles: RegExp[]; why: string }[] = [
  {
    file: 'src/hooks/usePremium.ts',
    needles: [/isFreeBetaPremiumUnlocked\s*\(/, /FREE_BETA_SNAPSHOT/, /premium:\s*true/],
    why: 'client premium hook must short-circuit to entitled under free-beta',
  },
  {
    file: 'src/lib/premiumServer.ts',
    needles: [/isFreeBetaPremiumUnlocked\s*\(/, /isPremiumBypassEnabled|isDemoPremiumEnabled/],
    why: 'server premium checks must honor free-beta bypass',
  },
  {
    file: 'src/lib/freeBeta.ts',
    needles: [/isFreeBetaPremiumUnlocked/, /return isFreeBeta\s*\(/],
    why: 'depth unlock is an alias of free-beta — not a second flag that can drift',
  },
];

test('free-beta depth unlock call sites still exist', () => {
  for (const row of DEPTH_UNLOCK) {
    const src = readFileSync(path.join(root, row.file), 'utf8');
    for (const re of row.needles) {
      assert.match(src, re, `${row.file}: ${row.why} (missing ${re})`);
    }
  }
});

test('paid mute surfaces and depth unlock are both documented in FREE_BETA.md', () => {
  const doc = readFileSync(path.join(root, 'docs/FREE_BETA.md'), 'utf8');
  assert.match(doc, /Mute pay|checkout muted|no live checkout/i);
  assert.match(doc, /Unlock depth|premium-entitled|isFreeBetaPremiumUnlocked/i);
  assert.match(doc, /NEXT_PUBLIC_FREE_BETA=false/);
});

test('UnlockButton mutes live checkout under free-beta and still has waitlist + paid body', () => {
  const src = readFileSync(path.join(root, 'src/components/UnlockButton.tsx'), 'utf8');
  assert.match(src, /isPaidCheckoutAllowed|checkoutMuted/);
  assert.doesNotMatch(src, /if\s*\(\s*isFreeBeta\s*\(\s*\)\s*\)\s*return\s*null/);
  assert.match(src, /createCheckoutForPlan|getStripeCheckoutUrl/);
  assert.match(src, /grantPremiumDemo|submitLead/);
});

test('Bundle route stays muted to /notify while free-beta is on', () => {
  const src = readFileSync(path.join(root, 'app/bundle/page.tsx'), 'utf8');
  assert.match(src, /isFreeBeta/);
  assert.match(src, /redirect\s*\(\s*['"]\/notify['"]\s*\)/);
  assert.match(src, /BundlePage/);
});
