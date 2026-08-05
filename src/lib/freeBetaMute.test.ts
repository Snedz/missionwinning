/**
 * Free-beta mute — pay surfaces stay dark while LLC/EIN clears.
 *
 * `isFreeBeta()` defaults ON. The product rule is: no Super Bundle merchandising
 * and no checkout CTAs. Features already call it in many places; this guard makes
 * the next silent re-introduction fail in CI (same class as pack `{{peso}}` drift).
 *
 * Discover merchandising links to `/bundle`; require `isFreeBeta` at each site.
 * Also pin the hard mute surfaces that must never regress.
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

/** Path data / SEO / titles — mention `/bundle` without selling it. */
const BUNDLE_PATH_ALLOWLIST = new Set([
  'src/lib/navConfig.ts',
  'src/lib/publicRoutes.ts',
  'src/lib/pageTitles.ts',
  'src/lib/safeRedirect.ts',
  'src/lib/publicSeo.ts',
  'src/lib/seoMetadata.ts',
  'src/lib/payments.ts',
  'src/lib/bundleConfig.ts',
  // Full page only mounts after free-beta redirect is false
  'src/page-components/BundlePage.tsx',
  // Legal copy may name the product SKU without a CTA
  'src/page-components/RefundsPage.tsx',
  'src/page-components/TermsPage.tsx',
  'src/page-components/PrivacyPage.tsx',
]);

const MUST_MUTE: { file: string; needles: RegExp[]; why: string }[] = [
  {
    file: 'app/bundle/page.tsx',
    needles: [/isFreeBeta\s*\(/, /redirect\s*\(/],
    why: 'route must 307 away while free-beta is on',
  },
  {
    file: 'app/sitemap.ts',
    needles: [/isFreeBeta\s*\(/, /\/bundle/],
    why: 'sitemap must not list /bundle during free-beta',
  },
  {
    file: 'src/components/UnlockButton.tsx',
    needles: [/isFreeBeta\s*\(/, /return null/],
    why: 'checkout CTA must render nothing in free-beta',
  },
  {
    file: 'src/components/crypto/PhantomLifetimePayButton.tsx',
    needles: [/isFreeBeta\s*\(/, /return null/],
    why: 'crypto lifetime checkout CTA must render nothing in free-beta',
  },
  {
    file: 'src/components/layout/MoreSheet.tsx',
    needles: [/isFreeBeta\s*\(/, /showBundle/],
    why: 'More nav Bundle row gated by free-beta',
  },
  {
    file: 'src/components/marketing/footerLinks.ts',
    needles: [/isFreeBeta\s*\(/, /\/bundle/],
    why: 'public footer drops Bundle link during free-beta',
  },
  {
    file: 'src/components/profile/ProfilePremiumCard.tsx',
    needles: [/isFreeBeta\s*\(/, /return null/],
    why: 'Profile premium upsell card hidden in free-beta',
  },
  {
    file: 'src/components/coach/CoachSoftBundleChatTip.tsx',
    needles: [/isFreeBeta\s*\(/, /return null/],
    why: 'Coach Bundle tip muted in free-beta',
  },
];

test('hard free-beta mute surfaces still call isFreeBeta', () => {
  for (const row of MUST_MUTE) {
    const abs = path.join(root, row.file);
    const src = readFileSync(abs, 'utf8');
    for (const re of row.needles) {
      assert.match(src, re, `${row.file}: ${row.why} (missing ${re})`);
    }
  }
});

test('merchandising /bundle links are free-beta gated (discover)', () => {
  const files = [...walk(path.join(root, 'app')), ...walk(path.join(root, 'src'))];
  const offenders: string[] = [];

  for (const abs of files) {
    const r = rel(abs);
    if (BUNDLE_PATH_ALLOWLIST.has(r)) continue;
    if (r.startsWith('src/i18n/')) continue;
    const src = readFileSync(abs, 'utf8');
    // Product links / CTAs, not prose-only path lists
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
    `these files merchandise /bundle without isFreeBeta() — free-beta would show pay UI:\n  ${offenders.join('\n  ')}`
  );
});

test('MUST_MUTE files still exist (no silent delete of the mute layer)', () => {
  for (const row of MUST_MUTE) {
    const abs = path.join(root, row.file);
    assert.ok(statSync(abs).isFile(), `missing mute surface ${row.file}`);
  }
});
