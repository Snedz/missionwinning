/**
 * Public marketing version vs internal unified build label.
 *
 * `/api/health` must stay on `APP_BUILD_LABEL` (gate-smoke / deploy). Athlete
 * chrome (gated www, about, version chips) stamps `APP_PUBLIC_*`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { validateBuildLabel } from '@/lib/deployReadiness';
import {
  APP_BUILD_LABEL,
  APP_PUBLIC_PRODUCT_VERSION,
  APP_PUBLIC_STAGE,
  APP_PUBLIC_STATUS_LINE_EN,
  APP_PUBLIC_VERSION,
} from '@/lib/buildInfo';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('internal build label stays the unified ship id', () => {
  assert.equal(validateBuildLabel(APP_BUILD_LABEL), true);
  assert.match(APP_BUILD_LABEL, /^\d{4}\.\d{2}-unified\.\d+$/);
});

test('athlete-facing version is Mission Winning Alpha 0.1.0', () => {
  assert.equal(APP_PUBLIC_VERSION, '0.1.0');
  assert.equal(APP_PUBLIC_STAGE, 'Alpha');
  assert.equal(APP_PUBLIC_PRODUCT_VERSION, 'Mission Winning Alpha 0.1.0');
  assert.equal(validateBuildLabel(APP_PUBLIC_VERSION), false);
  assert.doesNotMatch(APP_PUBLIC_VERSION, /v1\.0/i);
  assert.doesNotMatch(APP_PUBLIC_PRODUCT_VERSION, /v1\.0|invite-only|everything.?app/i);
});

test('English status line is free beta, not invite-only or everything-app', () => {
  assert.equal(
    APP_PUBLIC_STATUS_LINE_EN,
    `${APP_PUBLIC_PRODUCT_VERSION} — open alpha. Offline logging plus Mission Coach from your logs.`
  );
  assert.doesNotMatch(APP_PUBLIC_STATUS_LINE_EN, /invite-only|private beta|v1\.0|full platform|everything/i);
  assert.match(APP_PUBLIC_STATUS_LINE_EN, /open alpha/i);
});

test('health liveness reports APP_BUILD_LABEL, not the public stamp', () => {
  const src = read('app/api/health/route.ts');
  assert.match(src, /build:\s*APP_BUILD_LABEL/);
  assert.doesNotMatch(src, /build:\s*APP_PUBLIC_/);
  assert.match(src, /from '@\/lib\/buildInfo'/);
  assert.doesNotMatch(src, /APP_PUBLIC_VERSION|APP_PUBLIC_PRODUCT_VERSION/);
});

/**
 * Surfaces named in the ship: gated www, about, version chips. Enumerating
 * them is the claim — a file that should stamp and does not is the failure.
 */
const MUST_STAMP: { file: string; why: string }[] = [
  { file: 'app/private/PrivateTeaserClient.tsx', why: 'gated www (`/` while PRIVATE_MODE)' },
  { file: 'src/page-components/AboutPage.tsx', why: 'about body' },
  { file: 'src/components/public/PublicStatusBar.tsx', why: 'public chrome status strip' },
  { file: 'src/components/layout/Sidebar.tsx', why: 'desktop rail version chip' },
  { file: 'src/components/layout/MoreSheet.tsx', why: 'mobile More version chip' },
  { file: 'src/components/layout/AppLegalFooter.tsx', why: 'Profile/Account version chip' },
];

test('gated www, about, and version chips import the public stamp', () => {
  for (const { file, why } of MUST_STAMP) {
    const src = read(file);
    assert.match(
      src,
      /APP_PUBLIC_VERSION|APP_PUBLIC_PRODUCT_VERSION|APP_PUBLIC_STATUS_LINE_EN/,
      `${file} (${why}) does not import the public version constants`
    );
  }
});

test('About open-beta business copy interpolates productVersion', () => {
  const src = read('src/i18n/infoLocales.ts');
  const m = src.match(/infoAboutBusinessBodyOpenBeta:\s*\n?\s*'([^']*)'/);
  assert.ok(m?.[1], 'infoAboutBusinessBodyOpenBeta missing');
  assert.match(m[1], /\{\{productVersion\}\}/);
  assert.doesNotMatch(m[1], /0\.1 \(beta\)|v1\.0/i);
  const about = read('src/page-components/AboutPage.tsx');
  assert.match(about, /productVersion:\s*APP_PUBLIC_PRODUCT_VERSION/);
});

test('firstSteps status key interpolates to the same English stamp', () => {
  const src = read('src/i18n/firstStepsLocales.ts');
  const m = src.match(
    /publicStatusOpenBeta:\s*\n?\s*'([^']*)'/
  );
  assert.ok(m?.[1], 'firstStepsLocales is missing publicStatusOpenBeta');
  const template = m[1];
  assert.equal(
    template,
    '{{productVersion}} — open alpha. Offline logging plus Mission Coach from your logs.'
  );
  assert.doesNotMatch(template, /invite-only|full platform|v1\.0|everything/i);
  assert.equal(
    template.replace('{{productVersion}}', APP_PUBLIC_PRODUCT_VERSION),
    APP_PUBLIC_STATUS_LINE_EN
  );
});

/**
 * The rail used to paint `APP_BUILD_LABEL` as the athlete chip. Health +
 * Profile `Build {label}` remain the diagnostic; the rail chip must not.
 */
test('desktop rail version chip is the public stamp, not the unified label', () => {
  const src = read('src/components/layout/Sidebar.tsx');
  assert.match(src, /APP_PUBLIC_VERSION/);
  assert.doesNotMatch(src, /\{APP_BUILD_LABEL\}/);
});
