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
import { MOBILE_TAB_HREFS } from './primaryNav';

test('More tiers are Wedge · Pillars · You with declared hrefs', () => {
  assert.deepEqual(
    MORE_SHEET_TIER_HREFS.map((t) => t.id),
    ['wedge', 'pillars', 'you']
  );
  const wedge = MORE_SHEET_TIER_HREFS.find((t) => t.id === 'wedge')!;
  assert.ok(wedge.hrefs.includes('/history'));
  assert.ok(wedge.hrefs.includes('/leaderboard'), 'leaderboard is a Wedge row when surface on');
  assert.ok(wedge.hrefs.includes('/library'));
  assert.ok(wedge.hrefs.includes('/builder'));
  assert.ok(!wedge.hrefs.includes('/assessments'), 'PAR-Q is intake at /coach, not a More row');
  const pillars = MORE_SHEET_TIER_HREFS.find((t) => t.id === 'pillars')!;
  assert.ok(pillars.hrefs.includes('/move'));
  assert.ok(pillars.hrefs.includes('/learn'));
  assert.ok(!pillars.hrefs.includes('/nutrition'), 'Fuel is a tab — not a More row');
  const you = MORE_SHEET_TIER_HREFS.find((t) => t.id === 'you')!;
  assert.deepEqual([...you.hrefs], ['/profile', '/server', '/account']);
});

test('resolved tiers never include a mobile tab href', () => {
  const rows = moreSheetRowHrefs();
  for (const tab of MOBILE_TAB_HREFS) {
    assert.ok(!rows.includes(tab), `${tab} is a tab — must not appear in More rows`);
  }
  assert.ok(rows.includes('/history'));
  assert.ok(rows.includes('/leaderboard'));
  assert.ok(rows.includes('/profile'));
  assert.ok(rows.includes('/server'));
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

test('F-004: Pillars tier demoted until hasFirstWorkout', () => {
  const before = moreSheetTiersForNav({ hasFirstWorkout: false });
  assert.ok(!before.some((t) => t.id === 'pillars'), 'Pillars tier hidden pre-first-workout');
  assert.ok(before.some((t) => t.id === 'wedge'), 'Wedge rows stay (History/Library/…)');
  assert.ok(before.some((t) => t.id === 'you'), 'You tier stays');
  const rows = moreSheetRowHrefs({ hasFirstWorkout: false });
  for (const href of ['/move', '/mind', '/track', '/learn']) {
    assert.ok(!rows.includes(href), `${href} must not be a More row before first workout`);
  }

  const after = moreSheetTiersForNav({ hasFirstWorkout: true });
  assert.ok(after.some((t) => t.id === 'pillars'), 'Pillars return after first workout');
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
    /moreSheetTiersForNav\(\{\s*hasFirstWorkout\s*\}\)/,
    'MoreSheet must pass the first-workout gate — default-true would keep the options wall'
  );
});
