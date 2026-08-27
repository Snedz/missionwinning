/**
 * The signed-in house is a new website. If this looks like #885
 * (Log/Week/Catalog/You paper rail + HomeTodayLean), it failed.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { HOUSE_RAIL_HREFS } from '@/components/house/houseNav';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function walkHouse(): string[] {
  const dir = path.join(root, 'src/components/house');
  return readdirSync(dir)
    .filter((n) => /\.(ts|tsx|css)$/.test(n))
    .map((n) => `src/components/house/${n}`);
}

test('app group layout mounts HouseShell, not AppLayout', () => {
  const src = read('app/(app)/layout.tsx');
  assert.match(src, /HouseShell/);
  assert.doesNotMatch(src, /AppLayout/);
});

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

test('house chrome does not revive the field-manual rail or #885 groups', () => {
  for (const file of [...walkHouse(), 'src/page-components/TodayDesk.tsx', 'src/page-components/HomePage.tsx']) {
    const src = stripComments(read(file));
    assert.doesNotMatch(src, /railGroupsForNav|RAIL_GROUPS|navGroupMission|navGroupPillars|navGroupToolkit/, file);
    assert.doesNotMatch(src, /HomeTodayLean|TodayWeekDoor|TodaySummaryPins|TodayQuietWeekStrip/, file);
    assert.doesNotMatch(src, /APP_PUBLIC_STAGE/, file);
  }
});

test('icon rail is Today / Train / Library / Account — never /server or a feed', () => {
  assert.deepEqual(Object.values(HOUSE_RAIL_HREFS), ['/log', '/active', '/library', '/account']);
  const nav = stripComments(read('src/components/house/houseNav.ts'));
  assert.doesNotMatch(nav, /['"]\/server['"]|['"]\/explore['"]|['"]\/coaching['"]/);
});

test('catalog tabs are Library + Builder only', () => {
  const src = read('src/components/house/CatalogTabs.tsx');
  assert.match(src, /href="\/library"/);
  assert.match(src, /href="\/builder"/);
  assert.doesNotMatch(src, /\/explore|\/programs|\/bundle/);
});

test('Today Start is not the SSR dummy and lands on compose', () => {
  const src = stripComments(read('src/page-components/TodayDesk.tsx'));
  assert.doesNotMatch(src, /SSR_ACTION/);
  assert.doesNotMatch(src, /startWorkoutFromStore/);
  assert.doesNotMatch(src, /copy:\s*prev\.copy/);
  assert.match(src, /if \(!snap \|\| !action\) return/);
  assert.match(src, /disabled=\{!snap\}/);
  assert.match(src, /today-start-pending/);
  assert.match(src, /startLive\(/);
  assert.match(src, /router\.push\('\/active'\)/);
  const peek = read('src/lib/coach/peekCoachToday.ts');
  assert.match(peek, /typeof window === 'undefined'/);
});

test('Today desk keeps Start order engines', () => {
  const src = read('src/page-components/TodayDesk.tsx');
  assert.match(src, /pickHonoredStart/);
  assert.match(src, /peekCoachToday/);
  assert.match(src, /shouldRepeatLastOnToday/);
  assert.match(src, /runTodayPrimaryAction/);
  assert.match(src, /includeColdStart:\s*true/);
  assert.match(src, /doseScale:\s*liveReentry\.show\s*\?\s*liveReentry\.doseScale\s*:\s*1/);
});

test('HouseShell uses HouseMore, not the old WEDGE MoreSheet', () => {
  const src = stripComments(read('src/components/house/HouseShell.tsx'));
  assert.match(src, /HouseMore/);
  assert.doesNotMatch(src, /MoreSheet/);
  assert.match(src, /const compose = train/);
  const more = stripComments(read('src/components/house/HouseMore.tsx'));
  assert.doesNotMatch(more, /WEDGE|Leaderboard|navLeaderboard/);
  assert.match(more, /\/server/);
  const rail = stripComments(read('src/components/house/HouseIconRail.tsx'));
  assert.match(rail, /HOUSE_RAIL_HREFS\.account/);
  assert.match(rail, /house-rail-avatar/);
});

test('house.css actually draws a product site, not radius-0 paper rules', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-radius:\s*16px/);
  assert.match(css, /border-radius:\s*var\(--house-radius\)/);
  assert.match(css, /ui-sans-serif/);
  assert.match(css, /#ffffff/);
  assert.match(css, /--radius:\s*1rem/);
  assert.match(css, /--background:\s*0 0% 100%/);
  assert.match(css, /\.house-btn[\s\S]*flex-shrink:\s*0/);
  assert.match(css, /\.house-btn[\s\S]*white-space:\s*nowrap/);
  assert.doesNotMatch(css, /border:\s*2px/);
  assert.doesNotMatch(css, /\.mw-house \* \{[\s\S]*border-radius:\s*0/);
});
