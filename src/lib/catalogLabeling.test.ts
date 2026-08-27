/**
 * v0 catalog labeling (.1054).
 *
 * Official training catalog is /library + /builder. /explore is the places
 * pin-board (Decision 009). /programs is education outlines. Do not mint a
 * shop tab or /coaches. Isolation from .1053 stays in isolation.test.ts —
 * this file only names the catalog rooms.
 *
 * Discover rooms rather than listing them: a new /shop or /coaches page
 * would otherwise be invisible to a hand-maintained allowlist.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { MORE_NAV, RAIL_GROUPS } from '@/lib/navConfig';
import { MORE_SHEET_QUIET, MORE_SHEET_TIER_HREFS } from '@/lib/moreSheetTiers';
import { MOBILE_TAB_HREFS, PRIMARY_NAV, resolveMobileTabHrefs } from '@/lib/primaryNav';

const root = path.join(import.meta.dirname, '..', '..');

const FORBIDDEN_PRIMARY = ['/shop', '/store', '/marketplace', '/coaches', '/explore'] as const;

function appRoomDirs(): string[] {
  const dir = path.join(root, 'app', '(app)');
  return readdirSync(dir).filter((name) => {
    const st = statSync(path.join(dir, name));
    return st.isDirectory() && existsSync(path.join(dir, name, 'page.tsx'));
  });
}

test('official catalog rooms are Library + Builder', () => {
  const library = MORE_NAV.find((i) => i.href === '/library');
  const builder = MORE_NAV.find((i) => i.href === '/builder');
  assert.ok(library, '/library must stay in MORE_NAV');
  assert.ok(builder, '/builder must stay in MORE_NAV');
  assert.equal(library.label, 'Library');
  assert.equal(builder.label, 'Builder');
  assert.match(library.description ?? '', /catalog/i);
  assert.match(builder.description ?? '', /template/i);

  const catalog = MORE_SHEET_TIER_HREFS.find((t) => t.id === 'catalog');
  assert.ok(catalog, 'Catalog tier drifted');
  assert.ok(catalog.hrefs.includes('/library'), 'Library is a Search / More row');
  assert.ok(catalog.hrefs.includes('/builder'), 'Builder is a Search / More row');
});

test('primary nav and dock do not grow a shop or /coaches', () => {
  const primary = PRIMARY_NAV.map((n) => n.href);
  const dock = [
    ...MOBILE_TAB_HREFS,
    ...resolveMobileTabHrefs({ hasActiveWorkout: false }),
    ...resolveMobileTabHrefs({ hasActiveWorkout: true }),
  ];
  const rail = RAIL_GROUPS.flatMap((g) => g.hrefs);
  for (const href of FORBIDDEN_PRIMARY) {
    assert.ok(!primary.includes(href), `PRIMARY_NAV must not add ${href}`);
    assert.ok(!dock.includes(href), `dock must not add ${href}`);
    assert.ok(!rail.includes(href), `rail must not add ${href}`);
  }
});

test('app rooms do not mint /shop or /coaches', () => {
  const rooms = appRoomDirs();
  assert.ok(rooms.includes('library'), 'Library room missing');
  assert.ok(rooms.includes('builder'), 'Builder room missing');
  assert.ok(rooms.includes('explore'), 'Explore places room missing');
  assert.ok(!rooms.includes('shop'), 'do not mint a shop room');
  assert.ok(!rooms.includes('store'), 'do not mint a store room');
  assert.ok(!rooms.includes('coaches'), 'do not mint /coaches');
  assert.ok(!rooms.includes('marketplace'), 'do not mint a marketplace');
});

test('/explore stays the places pin-board, not a shop', () => {
  const page = readFileSync(path.join(root, 'app/(app)/explore/page.tsx'), 'utf8');
  assert.match(page, /ExplorePlacesPage/, '/explore must keep ExplorePlacesPage');
  assert.doesNotMatch(page, /shop|marketplace|SKU|nSuns/i);

  const places = readFileSync(path.join(root, 'src/page-components/ExplorePlacesPage.tsx'), 'utf8');
  assert.match(places, /pin board|places/i);
  assert.match(places, /Not a shop/);
  assert.doesNotMatch(
    places,
    /from ['"]@\/page-components\/(LibraryPage|BuilderPage)/,
    'places page must not import the training catalog'
  );

  const quiet = MORE_SHEET_QUIET.find((l) => l.href === '/explore');
  assert.ok(quiet, '/explore stays a quiet More door');
  assert.equal(quiet.label, 'Explore');
  assert.ok(
    !MORE_SHEET_TIER_HREFS.flatMap((t) => t.hrefs).includes('/explore'),
    '/explore is quiet foot, not a catalog row'
  );
});

test('Today still bans Explore — the existing gate is not vacated', () => {
  const ban = path.join(root, 'src/lib/places/exploreNotOnToday.test.ts');
  assert.ok(existsSync(ban), 'exploreNotOnToday.test.ts is the Today ban — do not delete it');
  const src = readFileSync(ban, 'utf8');
  assert.match(src, /Explore does not sit on Today/);
  assert.match(src, /\/explore/);
});

test('isolation from .1053 still names the log-path tabs', () => {
  const iso = readFileSync(path.join(root, 'src/lib/social/isolation.test.ts'), 'utf8');
  assert.match(iso, /log-path tabs stay \/log \+ \/active only/);
  assert.match(iso, /docs\/IA_SKELETON\.md/);
});
