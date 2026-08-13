/**
 * Preview walk P0-1: the analytics consent banner must not overlay Today's
 * first-set CTA. A `fixed bottom-0 z-[60]` dialog intercepts pointer events
 * on the ScreenDock Start control.
 *
 * Discover the banner + shell rather than enumerate callers — a new overlay
 * spelling must fail.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('consent banner is never position:fixed at the bottom', () => {
  const src = read('src/components/layout/AnalyticsConsentBanner.tsx');
  assert.doesNotMatch(
    src,
    /fixed(?:\s+|-)bottom-0|className="[^"]*fixed[^"]*bottom-0/,
    'AnalyticsConsentBanner must not be fixed bottom-0 — that covers Today Start on phones'
  );
  assert.doesNotMatch(
    src,
    /z-\[60\]/,
    'docked consent must not sit in a z-index overlay above the ScreenDock'
  );
  assert.match(src, /createPortal/, 'app-shell path portals into the reserved host');
  assert.match(src, /CONSENT_BANNER_HOST_ID/, 'banner looks up the AppLayout host');
  assert.match(src, /role="dialog"/, 'consent choice stays a dialog');
});

test('AppLayout reserves a flex host between ScreenDock and MobileNav', () => {
  const src = read('src/components/layout/AppLayout.tsx');
  const dock = src.indexOf('SCREEN_DOCK_HOST_ID');
  const consent = src.indexOf('CONSENT_BANNER_HOST_ID');
  const nav = src.indexOf('<MobileNav');
  assert.ok(dock >= 0 && consent >= 0 && nav >= 0, 'dock, consent host, and MobileNav must exist');
  assert.ok(
    dock < consent && consent < nav,
    'consent host must sit between #screen-dock and MobileNav so Start stays above the banner'
  );
  assert.match(src, /id=\{CONSENT_BANNER_HOST_ID\}/, 'host is a real element, not a comment');
});

test('I18nPwaProvider still mounts the consent banner', () => {
  const src = read('app/i18n-pwa-provider.tsx');
  assert.match(src, /<AnalyticsConsentBanner\s*\/>/, 'removing the mount hides consent');
});

test('ScreenDock exports the consent host id next to the dock id', () => {
  const src = read('src/components/layout/ScreenDock.tsx');
  assert.match(src, /export const CONSENT_BANNER_HOST_ID = 'consent-banner'/);
  assert.match(src, /export const SCREEN_DOCK_HOST_ID = 'screen-dock'/);
});
