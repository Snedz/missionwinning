import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  MORE_SHEET_TIER_HREFS,
  moreSheetQuietForNav,
  moreSheetRowHrefs,
  moreSheetTiersForNav,
} from './moreSheetTiers';


test('More tiers are Log · Week · Catalog · Pillars · You with declared hrefs', () => {
  assert.deepEqual(
    MORE_SHEET_TIER_HREFS.map((t) => t.id),
    ['log', 'week', 'catalog', 'pillars', 'you']
  );
  const log = MORE_SHEET_TIER_HREFS.find((t) => t.id === 'log')!;
  assert.ok(log.hrefs.includes('/history'));
  assert.ok(log.hrefs.includes('/active'), 'Train is Search when it is not a live tab');
  assert.ok(!log.hrefs.includes('/assessments'), 'PAR-Q is intake at /coach, not a More row');
  const week = MORE_SHEET_TIER_HREFS.find((t) => t.id === 'week')!;
  assert.deepEqual([...week.hrefs], ['/coach']);
  const catalog = MORE_SHEET_TIER_HREFS.find((t) => t.id === 'catalog')!;
  assert.ok(catalog.hrefs.includes('/library'));
  assert.ok(catalog.hrefs.includes('/builder'));
  const pillars = MORE_SHEET_TIER_HREFS.find((t) => t.id === 'pillars')!;
  assert.ok(pillars.hrefs.includes('/nutrition'), 'Fuel is Search, not a tab');
  assert.ok(pillars.hrefs.includes('/move'));
  assert.ok(pillars.hrefs.includes('/learn'));
  const you = MORE_SHEET_TIER_HREFS.find((t) => t.id === 'you')!;
  assert.ok(you.hrefs.includes('/profile'));
  assert.ok(you.hrefs.includes('/server'));
  assert.ok(you.hrefs.includes('/account'));
  assert.ok(you.hrefs.includes('/leaderboard'), 'leaderboard is a You row when surface on');
});

test('resolved tiers exclude only live tabs', () => {
  const cold = moreSheetRowHrefs({ hasActiveWorkout: false });
  assert.ok(cold.includes('/active'), 'cold Search must list Train');
  assert.ok(cold.includes('/coach'));
  assert.ok(cold.includes('/nutrition'));
  assert.ok(cold.includes('/history'));
  assert.ok(cold.includes('/leaderboard'));
  assert.ok(cold.includes('/profile'));
  assert.ok(cold.includes('/server'));
  assert.ok(!cold.includes('/log'), 'Summary is the remaining tab');

  const live = moreSheetRowHrefs({ hasActiveWorkout: true });
  assert.ok(!live.includes('/active'), 'live Train is a tab — not a Search row');
  assert.ok(live.includes('/coach'));
  assert.ok(live.includes('/nutrition'));
});

test('moreSheetTiersForNav returns non-empty items with labels', () => {
  const tiers = moreSheetTiersForNav();
  assert.ok(tiers.length >= 2);
  for (const tier of tiers) {
    assert.ok(tier.items.length > 0);
    for (const item of tier.items) {
      assert.ok(item.label.length > 0);
      assert.ok(item.href.startsWith('/'));
    }
  }
});

test('F-004: depth pillars demoted until hasFirstWorkout; Fuel stays', () => {
  const before = moreSheetTiersForNav({ hasFirstWorkout: false });
  assert.ok(before.some((t) => t.id === 'log'), 'Log rows stay (History/…)');
  assert.ok(before.some((t) => t.id === 'week'), 'Week row stays (Coach)');
  assert.ok(before.some((t) => t.id === 'catalog'), 'Catalog rows stay (Library/Builder)');
  assert.ok(before.some((t) => t.id === 'you'), 'You tier stays');
  const rows = moreSheetRowHrefs({ hasFirstWorkout: false });
  assert.ok(rows.includes('/nutrition'), 'Fuel stays reachable on I-Day');
  for (const href of ['/move', '/mind', '/track', '/learn']) {
    assert.ok(!rows.includes(href), `${href} must not be a More row before first workout`);
  }

  const after = moreSheetTiersForNav({ hasFirstWorkout: true });
  assert.ok(after.some((t) => t.id === 'pillars'), 'Pillars return after first workout');
  const afterRows = moreSheetRowHrefs({ hasFirstWorkout: true });
  for (const href of ['/nutrition', '/move', '/mind', '/track', '/learn']) {
    assert.ok(afterRows.includes(href), `${href} returns after first workout`);
  }
});

test('quiet foot keeps legal without duplicating full rows', () => {
  const quiet = moreSheetQuietForNav();
  const rows = new Set(moreSheetRowHrefs());
  for (const q of quiet) {
    assert.ok(!rows.has(q.href), `${q.href} should not be both a row and quiet`);
  }
  assert.ok(!quiet.some((q) => q.href === '/leaderboard'), 'leaderboard is a full row, not quiet');
  assert.ok(quiet.some((q) => q.href === '/privacy'));
  assert.ok(quiet.some((q) => q.href === '/terms'));
});

test('MoreSheet consumes moreSheetTiersForNav, not railGroupsForNav', () => {
  const src = readFileSync(
    path.join(import.meta.dirname, '..', 'components', 'layout', 'MoreSheet.tsx'),
    'utf8'
  );
  assert.match(src, /moreSheetTiersForNav/);
  assert.doesNotMatch(src, /railGroupsForNav\(\)/);
  assert.match(src, /moreSheetQuietForNav/);
  assert.match(
    src,
    /hasFirstWorkout/,
    'MoreSheet must pass the first-workout gate — default-true would keep the options wall'
  );
  assert.match(src, /hasActiveWorkout/, 'Search must hide Train only while a session is live');
  assert.match(src, /navSearch/);
});
