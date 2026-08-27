/**
 * Signed-in chrome names the three loops.
 *
 * Mission / Pillars / Toolkit was a 13-item inventory. The unlabeled
 * 5-item rail (#883) hid the names. This guard reads the declared
 * groups and the Sidebar markup so a costume or a thinner rail fails
 * here rather than in review.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { RAIL_GROUPS, railGroupsForNav } from '@/lib/navConfig';
import { MORE_SHEET_TIER_HREFS } from '@/lib/moreSheetTiers';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('rail groups are LOG · WEEK · CATALOG · You', () => {
  assert.deepEqual(
    RAIL_GROUPS.map((g) => g.id),
    ['log', 'week', 'catalog', 'you']
  );
  const byId = Object.fromEntries(RAIL_GROUPS.map((g) => [g.id, g.hrefs]));
  assert.deepEqual([...byId.log], ['/log', '/active', '/history']);
  assert.deepEqual([...byId.week], ['/coach']);
  assert.deepEqual([...byId.catalog], ['/library', '/builder']);
  assert.deepEqual([...byId.you], ['/profile', '/account']);
});

test('rail never lists Garage, pillars, or a shop', () => {
  const hrefs = RAIL_GROUPS.flatMap((g) => g.hrefs);
  for (const href of [
    '/server',
    '/nutrition',
    '/move',
    '/mind',
    '/track',
    '/learn',
    '/explore',
    '/shop',
    '/coaches',
  ]) {
    assert.ok(!hrefs.includes(href), `${href} must stay off the rail`);
  }
});

test('every rail group has a named title — not the unlabeled #883 rail', () => {
  for (const group of RAIL_GROUPS) {
    assert.ok(group.title.trim().length > 0, `${group.id} has no title`);
    assert.ok(group.titleKey.startsWith('navGroup'), `${group.id} titleKey drifted`);
  }
  const sidebar = read('src/components/layout/Sidebar.tsx');
  assert.match(sidebar, /group\.titleKey/, 'Sidebar must render group names');
  assert.match(sidebar, /navLabel/, 'Sidebar must keep item labels');
  assert.match(sidebar, /lg:text-\[15px\]/, 'wide rail keeps readable labels');
});

test('railGroupsForNav resolves the four loop groups with labels', () => {
  const groups = railGroupsForNav();
  assert.deepEqual(
    groups.map((g) => g.id),
    ['log', 'week', 'catalog', 'you']
  );
  for (const group of groups) {
    assert.ok(group.items.length > 0, `${group.id} emptied`);
    for (const item of group.items) {
      assert.ok(item.label.length > 0, `${item.href} lost its label`);
    }
  }
});

test('More sheet tiers teach the same loops; Garage stays You', () => {
  assert.deepEqual(
    MORE_SHEET_TIER_HREFS.map((t) => t.id),
    ['log', 'week', 'catalog', 'pillars', 'you']
  );
  const byId = Object.fromEntries(MORE_SHEET_TIER_HREFS.map((t) => [t.id, t.hrefs]));
  assert.ok(byId.log.includes('/history'));
  assert.ok(byId.log.includes('/active'));
  assert.deepEqual([...byId.week], ['/coach']);
  assert.ok(byId.catalog.includes('/library'));
  assert.ok(byId.catalog.includes('/builder'));
  assert.ok(byId.pillars.includes('/nutrition'));
  assert.ok(byId.you.includes('/profile'));
  assert.ok(byId.you.includes('/server'));
  assert.ok(byId.you.includes('/account'));
  assert.ok(!byId.you.includes('/log'));
  assert.ok(!MORE_SHEET_TIER_HREFS.flatMap((t) => t.hrefs).includes('/log'));
});
