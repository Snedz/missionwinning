/**
 * Free-beta mute — live checkout stays dark while LLC/EIN clears.
 *
 * Shop merchandising at `/bundle` is restored (Free vs Super Bundle). Charges
 * are not. Depth stays unlocked. See docs/SUPER_BUNDLE_SHOP_PLAN.md.
 *
 * Discover merchandising links to `/bundle` on wedge/pillar upsell surfaces;
 * those still require isFreeBeta. Shop chrome (footer, More, sitemap, landing
 * link, BundlePage) may always point at `/bundle`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === 'dist') continue;
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(name) && !name.includes('.test.') && !name.includes('.routetest.')) {
      out.push(p);
    }
  }
  return out;
}

function rel(p: string): string {
  return path.relative(root, p).replace(/\\/g, '/');
}

/** Path data / SEO / shop chrome — `/bundle` without a paywall CTA. */
const BUNDLE_PATH_ALLOWLIST = new Set([
  'src/lib/navConfig.ts',
  'src/lib/publicRoutes.ts',
  'src/lib/pageTitles.ts',
  'src/lib/safeRedirect.ts',
  'src/lib/publicSeo.ts',
  'src/lib/seoMetadata.ts',
  'src/lib/payments.ts',
  'src/lib/bundleConfig.ts',
  'src/lib/bundleShop.ts',
  'src/page-components/BundlePage.tsx',
  'src/components/bundle/BundleShopStack.tsx',
  'src/components/UnlockButton.tsx',
  'app/bundle/page.tsx',
  'app/sitemap.ts',
  'src/components/marketing/footerLinks.ts',
  'src/components/layout/MoreSheet.tsx',
  'src/components/layout/InfoPageFooter.tsx',
  'src/page-components/LandingPage.tsx',
  'src/page-components/RefundsPage.tsx',
  'src/page-components/TermsPage.tsx',
  'src/page-components/PrivacyPage.tsx',
]);

const MUST_MUTE: { file: string; needles: RegExp[]; why: string }[] = [
  {
    file: 'src/components/UnlockButton.tsx',
    needles: [/isPaidCheckoutAllowed|checkoutMuted/, /hasLiveCheckout/],
    why: 'live checkout must stay dark in free-beta; waitlist may render',
  },
  {
    file: 'src/lib/payments.ts',
    needles: [/isPaidCheckoutAllowed/, /isFreeBeta/],
    why: 'one checkout-allowance door — false while free-beta',
  },
  {
    file: 'src/components/crypto/PhantomLifetimePayButton.tsx',
    needles: [/isFreeBeta\s*\(/, /return null/],
    why: 'crypto lifetime checkout CTA must render nothing in free-beta',
  },
  {
    file: 'src/components/profile/ProfilePremiumCard.tsx',
    needles: [/isFreeBeta\s*\(/, /return null/],
    why: 'Profile premium upsell card hidden in free-beta (shop is /bundle)',
  },
  {
    file: 'src/components/coach/CoachSoftBundleChatTip.tsx',
    needles: [/isFreeBeta\s*\(/, /return null/],
    why: 'Coach Bundle tip muted in free-beta',
  },
  {
    file: 'src/components/journey/TodayQuickLinks.tsx',
    needles: [/isFreeBeta\s*\(/, /showBundle/],
    why: 'Today quick links stay off the shop — do not restyle Today',
  },
];

test('hard free-beta mute surfaces still call the checkout mute', () => {
  for (const row of MUST_MUTE) {
    const abs = path.join(root, row.file);
    const src = readFileSync(abs, 'utf8');
    for (const re of row.needles) {
      assert.match(src, re, `${row.file}: ${row.why} (missing ${re})`);
    }
  }
});

test('wedge/pillar /bundle upsells stay free-beta gated (discover)', () => {
  const files = [...walk(path.join(root, 'app')), ...walk(path.join(root, 'src'))];
  const offenders: string[] = [];

  for (const abs of files) {
    const r = rel(abs);
    if (BUNDLE_PATH_ALLOWLIST.has(r)) continue;
    if (r.startsWith('src/i18n/')) continue;
    const src = readFileSync(abs, 'utf8');
    const sellsBundle =
      /href\s*=\s*\{?\s*['"`]\/bundle['"`]/.test(src) ||
      /to\s*=\s*['"`]\/bundle['"`]/.test(src) ||
      /push\(\s*['"`]\/bundle['"`]/.test(src) ||
      /Link[^\n]{0,80}\/bundle/.test(src);
    if (!sellsBundle) continue;
    if (!/isFreeBeta\s*\(/.test(src)) {
      offenders.push(r);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `these files merchandise /bundle without isFreeBeta() — wedge/pillar upsell during free-beta:\n  ${offenders.join('\n  ')}`
  );
});

test('MUST_MUTE files still exist (no silent delete of the mute layer)', () => {
  for (const row of MUST_MUTE) {
    const abs = path.join(root, row.file);
    assert.ok(statSync(abs).isFile(), `missing mute surface ${row.file}`);
  }
});

test('bundle route 307s to /notify while free-beta mutes the shop', () => {
  const src = readFileSync(path.join(root, 'app/bundle/page.tsx'), 'utf8');
  assert.match(src, /isFreeBeta/);
  assert.match(src, /redirect\s*\(\s*['"]\/notify['"]\s*\)/);
  assert.match(src, /BundlePage/);
});
