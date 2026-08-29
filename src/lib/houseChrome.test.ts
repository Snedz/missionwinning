/**
 * The signed-in house is a new website. If this looks like #885
 * (Log/Week/Catalog/You paper rail + HomeTodayLean), it failed.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  HOUSE_LIBRARY_ROOMS,
  HOUSE_MORE_QUIET,
  HOUSE_MORE_ROOMS,
  HOUSE_RAIL_HREFS,
  HOUSE_TODAY_ROOMS,
  houseCanvasTitle,
  houseSecondDockForPath,
} from '@/components/house/houseNav';

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
  const railSrc = stripComments(read('src/components/house/houseNav.ts'));
  const railBlock = railSrc.slice(
    railSrc.indexOf('export const HOUSE_RAIL_HREFS'),
    railSrc.indexOf('export type HouseSecondDock')
  );
  assert.doesNotMatch(railBlock, /['"]\/server['"]|['"]\/explore['"]|['"]\/coaching['"]/);
  assert.doesNotMatch(railSrc, /['"]\/explore['"]|['"]\/coaching['"]/);
});

test('catalog objects live on the left second rail', () => {
  const src = read('src/components/house/HouseSecondRail.tsx');
  assert.match(src, /HOUSE_LIBRARY_ROOMS/);
  assert.match(src, /HOUSE_TODAY_ROOMS/);
  assert.doesNotMatch(src, /\/explore|\/programs|\/bundle|\/server/);
  const nav = read('src/components/house/houseNav.ts');
  assert.match(nav, /href: '\/library'/);
  assert.match(nav, /href: '\/builder'/);
  assert.match(nav, /label: 'Weekly plan'/);
});

test('HouseShell opens a left second bar, not More as the Home pattern', () => {
  const shell = stripComments(read('src/components/house/HouseShell.tsx'));
  assert.match(shell, /HouseSecondRail/);
  assert.match(shell, /HouseGuide/);
  assert.match(shell, /houseSecondDockForPath/);
  assert.match(shell, /is-second/);
  assert.match(shell, /data-house-frame=\{dock \? 'second-left' : 'rail'\}/);
  assert.match(shell, /onOpenHome=\{openHome\}/);
  assert.match(shell, /onOpenLibrary=\{openLibrary\}/);
  assert.match(shell, /house-sheet/);
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-rail:\s*72px/);
  assert.match(css, /--house-second:\s*264px/);
  assert.match(css, /min-width:\s*723px/);
  assert.match(css, /max-width:\s*722px/);
  assert.match(css, /\.house-second/);
  assert.match(css, /\.house-sheet/);
  assert.match(css, /\.house-rail-tip/);
  assert.match(css, /font-size:\s*13px/);
  assert.match(css, /rgba\(0,\s*0,\s*0,\s*0\.6\)/);
  assert.match(css, /--house-ease:\s*cubic-bezier/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /house-pane-in/);
  assert.match(css, /house-guide-in/);
  assert.match(css, /house-second-in/);
  assert.match(
    css,
    /grid-template-columns:\s*var\(--house-rail\)\s+minmax\(0,\s*1fr\)/
  );
  assert.match(
    css,
    /grid-template-columns:\s*var\(--house-second-w\)\s+minmax\(0,\s*1fr\)/
  );
  assert.match(css, /\.house-frame\.is-second \{[\s\S]*--house-second-w:\s*var\(--house-second\)/);
  const more = stripComments(read('src/components/house/HouseMore.tsx'));
  assert.doesNotMatch(more, /href: '\/history'/);
  assert.doesNotMatch(more, /href: '\/coach'/);
  assert.doesNotMatch(more, /href: '\/active'/);
  assert.match(more, /house-side-link\$\{on \? ' is-on' : ''\}/);
  assert.match(more, /className=\{on \? 'is-on' : undefined\}/);
  assert.match(css, /\.house-side-link \{[\s\S]*--house-radius-row/);
  assert.match(css, /\.house-side-link\.is-on \{[\s\S]*--house-selected/);
  assert.match(css, /\.house-more-quiet \{[^}]*flex-direction:\s*column/);
  assert.match(css, /\.house-more-quiet a\.is-on \{[^}]*background:\s*transparent/);
  assert.doesNotMatch(
    css,
    /\.house-more-quiet a\.is-on \{[^}]*--house-selected/,
    'quiet foot is ink, not the leftover selected fill'
  );
});

test('Today Start is not the SSR dummy and lands on compose', () => {
  const src = stripComments(read('src/page-components/TodayDesk.tsx'));
  assert.doesNotMatch(src, /SSR_ACTION/);
  assert.doesNotMatch(src, /startWorkoutFromStore/);
  assert.doesNotMatch(src, /copy:\s*prev\.copy/);
  assert.match(src, /writeTodayComposeSession\(\);\s*router\.push\('\/active'\)/);
  assert.doesNotMatch(src, /disabled=\{!snap\}/);
  assert.doesNotMatch(src, /startEmptyWorkout|startEmpty\(/);
  assert.match(src, /writeTodayComposeSession\(\)/);
  assert.match(src, /today-start-pending/);
  assert.match(src, /justGoTitle/);
  assert.match(src, /<HouseFirstRoomsCard/);
  assert.match(src, /id="today-week"/);
  assert.match(src, /router\.push\('\/active'\)/);
  const peek = read('src/lib/coach/peekCoachToday.ts');
  assert.match(peek, /typeof window === 'undefined'/);
});

test('/active first paint is a compose table, never Restoring as the product', () => {
  const empty = stripComments(read('src/components/house/TrainComposeEmpty.tsx'));
  assert.doesNotMatch(empty, /Restoring session|activeLoadingSession|Reading the last workout/);
  assert.match(empty, /aria-busy=\{hydrated \? undefined : true\}/);
  const route = stripComments(read('app/(app)/active/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading/);
  assert.match(route, /import \{ ActiveWorkoutPage \}/);
  const activeLoading = stripComments(read('app/(app)/active/loading.tsx'));
  assert.match(activeLoading, /ActiveWorkoutPage/);
  assert.doesNotMatch(activeLoading, /SkeletonCard|Loading…/);
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /Restoring session|activeLoadingSession|ActiveEmptyState/);
  assert.match(active, /useLayoutEffect/);
  assert.match(active, /writeTodayComposeSession\(\)/);
  assert.match(active, /paintTodayComposeWorkout/);
  assert.match(active, /composeNextSet\(activeWorkout\)/);
  assert.doesNotMatch(active, /activeWorkout \? findNextSet\(activeWorkout\.exercises\) : null/);
  assert.match(active, /await reconcileOpenSession/);
  assert.match(active, /hasComposeExercises\(store\.activeWorkout\)/);
  assert.match(active, /parseSeoExerciseParam\(searchParams\)/);
  assert.match(active, /previewJustGoForEquipment/);
  assert.match(active, /aria-busy=\{hasHydrated \? undefined : true\}/);
  const layout = active.slice(
    active.indexOf('useLayoutEffect(() =>'),
    active.indexOf('useEffect(() => {\n    if (!hasHydrated) return;')
  );
  assert.doesNotMatch(layout, /hasHydrated/);
  const emptyStart = active.slice(
    active.indexOf('const handleEmptyStart'),
    active.indexOf('const handlePreviewStart')
  );
  assert.doesNotMatch(emptyStart, /previewJustGoForEquipment|startWorkout\(preview/);
});

test('Today desk keeps Start order engines', () => {
  const src = read('src/page-components/TodayDesk.tsx');
  assert.match(src, /pickHonoredStart/);
  assert.match(src, /peekCoachToday/);
  assert.match(src, /shouldRepeatLastOnToday/);
  assert.match(src, /writeTodayComposeSession/);
  const handle = src.slice(src.indexOf('const handleStart'), src.indexOf('const sessionTitle'));
  assert.match(handle, /writeTodayComposeSession\(\);\s*router\.push\('\/active'\)/);
  assert.doesNotMatch(handle, /runTodayPrimaryAction/);
  const writer = read('src/lib/workout/writeTodayComposeSession.ts');
  assert.match(writer, /pickHonoredStart/);
  assert.match(writer, /peekCoachToday/);
  assert.match(writer, /shouldRepeatLastOnToday/);
  assert.match(writer, /buildJustGoSession/);
});

test('Today desk has one filled action — week generate is a door to /coach', () => {
  const src = stripComments(read('src/page-components/TodayDesk.tsx'));
  const primaries = [...src.matchAll(/house-btn-primary/g)];
  assert.equal(primaries.length, 1, 'Start is the only filled action on Today');
  assert.match(src, /href="\/coach"/);
  assert.match(src, /data-house-week-writer="generateWeek"/);
  assert.doesNotMatch(src, /generateWeek\(/);
});

test('HouseShell uses HouseMore, not the old WEDGE MoreSheet', () => {
  const src = stripComments(read('src/components/house/HouseShell.tsx'));
  assert.match(src, /HouseMore/);
  assert.doesNotMatch(src, /MoreSheet/);
  assert.match(src, /const compose = train/);
  const more = stripComments(read('src/components/house/HouseMore.tsx'));
  assert.doesNotMatch(more, /WEDGE|Leaderboard|navLeaderboard/);
  assert.match(more, /HOUSE_MORE_QUIET/);
  const rail = stripComments(read('src/components/house/HouseIconRail.tsx'));
  assert.match(rail, /HOUSE_RAIL_HREFS\.account/);
  assert.match(rail, /house-rail-avatar/);
  assert.match(rail, /house-rail-tip/);
  assert.match(rail, /defaultValue: 'You'/);
  assert.match(rail, /defaultValue: 'Today'/);
  assert.match(rail, /defaultValue: 'Train'/);
  assert.match(rail, /defaultValue: 'Library'/);
  assert.match(rail, /defaultValue: 'More'/);
});

test('checklist never owns Start, and house copy is not a pasted brand', () => {
  const src = stripComments(read('src/page-components/TodayDesk.tsx'));
  const startAt = src.indexOf('id="today-start"');
  const weekAt = src.indexOf('id="today-week"');
  const stepsAt = src.indexOf('<HouseFirstRoomsCard');
  assert.ok(startAt > 0 && weekAt > startAt, 'Start is first; week follows');
  assert.ok(stepsAt > startAt && stepsAt < weekAt, 'checklist sits under Start, before week');
  assert.match(src, /snap \?/);
  assert.doesNotMatch(src, /getFirstSteps|summarizeFirstSteps/);
  const guide = stripComments(read('src/components/house/HouseGuide.tsx'));
  assert.match(guide, /houseGuideGotIt/);
  assert.match(guide, /#today-start/);
  assert.doesNotMatch(guide, /today-start-ready/);
  assert.match(guide, /onClick=\{dismiss\}/);
  assert.doesNotMatch(guide, /setStep|railStep|next =/);
  const card = stripComments(read('src/components/house/HouseFirstRoomsCard.tsx'));
  const rooms = stripComments(read('src/components/house/houseFirstRooms.ts'));
  assert.match(card, /firstStepsCount/);
  assert.match(card, /house-lock-tip/);
  assert.match(rooms, /houseFirstLogTitle/);
  assert.match(rooms, /Log a set/);
  assert.match(rooms, /Open this week/);
  assert.match(rooms, /Open History after a finish/);
  const second = stripComments(read('src/components/house/HouseSecondRail.tsx'));
  assert.match(second, /house-second-back/);
  assert.match(second, /houseWeekPaneTitle/);
  assert.match(second, /closePane/);
  assert.match(second, /data-house-second-dock="left"/);
  assert.match(second, /data-house-week-writer="generateWeek"/);
  assert.match(second, /href="\/coach"/);
  assert.doesNotMatch(second, /generateWeek\(/);
  const more = stripComments(read('src/components/house/HouseMore.tsx'));
  assert.match(more, /HOUSE_MORE_QUIET/);
  assert.match(more, /HOUSE_MORE_ROOMS/);
  for (const file of [...walkHouse(), 'src/page-components/TodayDesk.tsx']) {
    const text = stripComments(read(file));
    assert.doesNotMatch(
      text,
      /Welcome to Patreon|Audience|Payouts|Publish page|Dashboard \/ Library|Ways to earn|Promote your|membership upsell/i,
      file
    );
  }
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

test('second bar is a left column next to the rail — never a far-right sheet', () => {
  const css = read('src/components/house/house.css');
  const secondBlocks = [...css.matchAll(/\.mw-house \.house-second\s*\{([^}]+)\}/g)].map((m) => m[1] ?? '');
  assert.ok(secondBlocks.length >= 1, 'house-second must have a rule');
  for (const block of secondBlocks) {
    assert.doesNotMatch(block, /(?:^|[^-])right\s*:/);
    assert.doesNotMatch(block, /position\s*:\s*fixed/);
    assert.doesNotMatch(block, /inset\s*:/);
  }
  assert.match(css, /\.house-sheet\.is-second > \.house-stage \{[\s\S]*grid-column:\s*2/);
  assert.match(css, /\.house-second \{[\s\S]*grid-column:\s*1/);
  const moreCss = [...css.matchAll(/\.mw-house \.house-more-panel\s*\{([^}]+)\}/g)].map((m) => m[1] ?? '');
  assert.ok(moreCss.some((block) => /right\s*:\s*0/.test(block)), 'More leftover may stay a right sheet');
  const rail = stripComments(read('src/components/house/HouseIconRail.tsx'));
  const homeAt = rail.indexOf('data-house-rail-open="home"');
  const moreAt = rail.indexOf('data-house-rail-open="more"');
  assert.ok(homeAt > 0 && moreAt > homeAt, 'Home rail control comes before More');
  assert.doesNotMatch(rail.slice(homeAt, moreAt), /onOpenMore/);
  assert.match(rail.slice(homeAt, moreAt), /onOpenHome/);
});

test('Home and Library docks transfer the real rooms, Start composes', () => {
  assert.deepEqual(
    HOUSE_TODAY_ROOMS.map((row) => [row.id, row.href]),
    [
      ['start', '/active'],
      ['week', '/log'],
      ['history', '/history'],
      ['plan', '/coach'],
    ]
  );
  assert.equal(HOUSE_TODAY_ROOMS[0]?.kind, 'compose');
  const second = stripComments(read('src/components/house/HouseSecondRail.tsx'));
  assert.match(second, /writeTodayComposeSession\(\)/);
  assert.match(second, /row\.id === 'start'/);
  assert.match(second, /preventDefault/);
  assert.deepEqual(
    HOUSE_LIBRARY_ROOMS.map((row) => row.href),
    ['/library', '/builder']
  );
  assert.deepEqual(
    HOUSE_MORE_ROOMS.map((row) => row.href),
    ['/nutrition', '/profile', '/account']
  );
  assert.deepEqual(
    HOUSE_MORE_QUIET.map((row) => row.href),
    ['/move', '/mind', '/track', '/learn', '/feedback', '/server']
  );
  assert.equal(houseSecondDockForPath('/log'), 'home');
  assert.equal(houseSecondDockForPath('/history'), 'home');
  assert.equal(houseSecondDockForPath('/coach'), 'home');
  assert.equal(houseSecondDockForPath('/library'), 'library');
  assert.equal(houseSecondDockForPath('/builder'), 'library');
  assert.equal(houseSecondDockForPath('/active'), null);
  assert.equal(houseSecondDockForPath('/nutrition'), null);
  assert.equal(houseSecondDockForPath('/account'), null);
  assert.equal(houseCanvasTitle('/history'), 'History');
  assert.equal(houseCanvasTitle('/coach'), 'Weekly plan');
  assert.equal(houseCanvasTitle('/library'), 'Library');
  assert.equal(houseCanvasTitle('/builder'), 'Builder');
  assert.equal(houseCanvasTitle('/log'), 'Today');
  assert.equal(houseCanvasTitle('/active'), null);
  assert.equal(houseCanvasTitle('/nutrition'), null);
  const refused = [...HOUSE_TODAY_ROOMS, ...HOUSE_LIBRARY_ROOMS, ...HOUSE_MORE_ROOMS, ...HOUSE_MORE_QUIET]
    .map((row) => row.href)
    .join(' ');
  assert.doesNotMatch(refused, /\/crew|\/explore|\/coaching/);
});

test('transferred rooms drop the old pillar costume, leftover rooms keep a quiet title', () => {
  const header = read('src/components/layout/PillarPageHeader.tsx');
  assert.match(header, /data-house-costume="pillar-header"/);
  const shell = stripComments(read('src/components/house/HouseShell.tsx'));
  assert.match(shell, /is-transferred/);
  assert.match(shell, /data-house-transferred/);
  assert.match(shell, /houseCanvasTitle/);
  assert.match(shell, /sr-only/);
  assert.doesNotMatch(shell, /CatalogTabs/);
  const css = read('src/components/house/house.css');
  assert.match(css, /data-house-costume=['"]pillar-header['"]/);
  assert.match(css, /\.is-transferred/);
  assert.match(css, /house-canvas-in/);
  assert.match(css, /--house-second-w/);
  assert.match(css, /\.house-second-nav \.house-second-link:nth-child\(2\) \{[\s\S]*animation-delay:\s*40ms/);
  assert.match(css, /\.is-transferred \.eyebrow/);
  const coach = read('src/page-components/CoachPage.tsx');
  assert.doesNotMatch(coach, /eyebrow mb-3 text-primary/);
  assert.match(coach, /generate\(/);
});

test('house design system is the signed-in token table', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /--house-rail/);
  assert.match(spec, /72px/);
  assert.match(spec, /264px/);
  assert.match(spec, /--house-press/);
  assert.match(spec, /Train pulse only/);
  assert.doesNotMatch(spec, /Welcome to Patreon|Oracle|Ways to earn|Audience|Publish page/i);
  const index = read('src/components/house/INDEX.md');
  assert.match(index, /DESIGN\.md/);
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-rail:\s*72px/);
  assert.match(css, /--house-second:\s*264px/);
  assert.match(css, /--house-radius:\s*16px/);
  assert.match(css, /--house-radius-row:\s*12px/);
  assert.match(css, /--house-radius-rail:\s*8px/);
  assert.match(css, /--house-radius-sheet:\s*12px/);
  assert.match(css, /--house-selected:\s*#eeeeee/);
  assert.match(css, /--house-live:\s*#ae1800/);
  assert.match(css, /\.house-rail \.house-rail-plus \{[\s\S]*width:\s*40px/);
  assert.match(css, /\.house-empty/);
  assert.match(css, /\.house-filter-bar/);
  const library = read('src/page-components/LibraryPage.tsx');
  assert.match(library, /house-empty/);
  assert.match(library, /house-filter-bar/);
  assert.match(library, /className="house-list"/);
  assert.match(library, /className="house-item"/);
  assert.match(library, /house-item-pick/);
  assert.match(library, /house-item-body/);
  const libraryFilters = library.slice(
    Math.max(0, library.indexOf('library-filters-open') - 240),
    library.indexOf('library-filters-open') + 240
  );
  assert.match(libraryFilters, /house-btn house-btn-ghost house-filter-btn shrink-0 gap-1.5 tap-target/);
  assert.match(libraryFilters, /data-testid="library-filters-open"/);
  assert.doesNotMatch(libraryFilters, /<Button[\s>]/);
  assert.doesNotMatch(libraryFilters, /variant="outline"/);
  assert.match(spec, /Library Filters is house leftover/);
  assert.match(library, /mw-house house-library-filters/);
  const libraryFilterSheet = library.slice(
    library.indexOf('house-library-filters'),
    library.indexOf('</AdaptiveOverlay>')
  );
  assert.match(libraryFilterSheet, /house-state tap-target/);
  assert.match(libraryFilterSheet, /house-btn house-btn-ghost min-h-\[44px\] flex-1 tap-target/);
  assert.match(libraryFilterSheet, /house-btn min-h-\[44px\] flex-1 tap-target/);
  assert.doesNotMatch(libraryFilterSheet, /FilterChip/);
  assert.doesNotMatch(libraryFilterSheet, /uppercase tracking/);
  assert.doesNotMatch(libraryFilterSheet, /<Button[\s>]/);
  assert.doesNotMatch(libraryFilterSheet, /primary-action/);
  assert.match(css, /\.mw-house\.house-library-filters \.house-state\.is-on \{[^}]*--house-selected/);
  assert.match(spec, /Library Filters sheet is house leftover/);
  const libraryDetail = read('src/components/library/LibraryDetailSheet.tsx');
  assert.match(libraryDetail, /mw-house house-library-detail/);
  assert.match(libraryDetail, /house-btn house-btn-primary min-h-\[52px\] w-full tap-target/);
  assert.match(libraryDetail, /house-btn house-btn-ghost min-h-\[44px\] w-full tap-target/);
  assert.match(libraryDetail, /data-testid="library-hide"/);
  assert.doesNotMatch(libraryDetail, /<Button[\s>]/);
  assert.doesNotMatch(libraryDetail, /<Badge/);
  assert.doesNotMatch(libraryDetail, /border-2/);
  assert.doesNotMatch(libraryDetail, /uppercase tracking/);
  assert.doesNotMatch(libraryDetail, /primary-action/);
  assert.match(spec, /Library detail is house leftover/);
  const libraryHidden = library.slice(
    Math.max(0, library.indexOf('house-library-hidden') - 80),
    library.indexOf('house-filter-bar')
  );
  assert.match(library, /hiddenRows\.length > 0/);
  assert.match(libraryHidden, /house-card house-library-hidden/);
  assert.match(libraryHidden, /house-kicker/);
  assert.match(libraryHidden, /house-lede/);
  assert.match(libraryHidden, /house-item house-library-hidden-row/);
  assert.match(libraryHidden, /house-btn house-btn-ghost min-h-\[44px\] shrink-0 tap-target/);
  assert.match(libraryHidden, /data-testid="library-unhide"/);
  assert.doesNotMatch(libraryHidden, /<Button[\s>]/);
  assert.doesNotMatch(libraryHidden, /border-2/);
  assert.doesNotMatch(libraryHidden, /uppercase tracking/);
  assert.match(css, /\.house-catalog \.house-library-hidden \.house-item \{[^}]*--house-line/);
  assert.match(spec, /Library hidden is house leftover/);
  const librarySearch = library.slice(
    library.indexOf('house-filter-bar'),
    library.indexOf('library-states')
  );
  assert.match(librarySearch, /house-field house-library-search min-h-\[44px\]/);
  assert.match(librarySearch, /type="search"/);
  assert.match(librarySearch, /data-testid="library-search"/);
  assert.doesNotMatch(librarySearch, /<Input[\s>]/);
  assert.match(css, /\.house-catalog \.house-filter-bar \.house-field \{[^}]*--house-line/);
  assert.match(spec, /Library search is house leftover/);
  const libraryShowing = library.slice(
    Math.max(0, library.indexOf('libraryShowingCount') - 80),
    library.indexOf('libraryShowingCount') + 40
  );
  assert.match(libraryShowing, /house-lede house-library-showing/);
  assert.doesNotMatch(libraryShowing, /text-muted-foreground/);
  assert.match(css, /\.house-catalog \.house-library-showing \{[^}]*font-size:\s*13px/);
  assert.match(spec, /Library showing count is house leftover/);
  const libraryPick = library.slice(
    library.indexOf('className="house-pick-bar"'),
    library.indexOf('library-merge-dialog')
  );
  assert.match(libraryPick, /house-pick-bar/);
  assert.match(libraryPick, /house-kicker/);
  assert.match(libraryPick, /house-btn house-btn-ghost min-h-\[44px\] tap-target/);
  assert.match(libraryPick, /house-btn house-btn-primary primary-action min-h-\[44px\] tap-target/);
  assert.doesNotMatch(libraryPick, /<Button[\s>]/);
  assert.doesNotMatch(libraryPick, /uppercase tracking/);
  assert.doesNotMatch(libraryPick, /border-t-2/);
  assert.doesNotMatch(libraryPick, /border-2/);
  assert.match(css, /\.house-pick-bar \{[^}]*--house-line/);
  assert.match(spec, /Library pick bar is house leftover/);
  const libraryExtras = library.slice(
    library.lastIndexOf('<details', library.indexOf('library-show-all')),
    library.indexOf('library-merge-open') + 200
  );
  assert.match(libraryExtras, /house-card group/);
  assert.match(libraryExtras, /house-show-all-body/);
  assert.match(libraryExtras, /data-testid="library-show-all"/);
  assert.match(libraryExtras, /library-merge-open/);
  assert.doesNotMatch(libraryExtras, /border-t-2/);
  assert.doesNotMatch(libraryExtras, /border-2/);
  assert.match(css, /\.house-catalog \.house-show-all-body \{[^}]*--house-line/);
  assert.match(spec, /Library Show all extras is house leftover/);
  const libraryRoute = stripComments(read('app/(app)/library/page.tsx'));
  assert.doesNotMatch(libraryRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(libraryRoute, /import \{ LibraryPage \}/);
  assert.match(spec, /Library first paint is house leftover/);
  assert.match(css, /\.house-catalog \.house-item-pick/);
  assert.match(css, /\.house-floor \.house-rail-plus \{[\s\S]*width:\s*40px/);
  assert.match(css, /\.house-history \.house-item/);
  assert.match(css, /\.house-dock \.primary-action/);
  const history = read('src/page-components/HistoryPage.tsx');
  assert.match(history, /className="house-history"/);
  assert.match(history, /className="house-list"/);
  assert.match(history, /house-item-body/);
  const historyFirst = history.slice(0, history.indexOf('history-show-all'));
  assert.match(historyFirst, /house-btn house-btn-ghost min-h-\[44px\] w-full tap-target/);
  assert.match(historyFirst, /data-testid="session-history-backfill-open"/);
  assert.doesNotMatch(historyFirst, /<Button[\s>]/);
  assert.doesNotMatch(historyFirst, /variant="outline"/);
  assert.match(spec, /History tools are house leftover/);
  const historySearch = history.slice(
    Math.max(0, history.indexOf('session-history-search') - 160),
    history.indexOf('house-catalog-states')
  );
  assert.match(historySearch, /house-field house-history-search sm:flex-1 min-h-\[44px\]/);
  assert.match(historySearch, /type="search"/);
  assert.match(historySearch, /data-testid="session-history-search"/);
  assert.doesNotMatch(historySearch, /<Input[\s>]/);
  assert.match(css, /\.house-history \.house-filter-bar \.house-field \{[^}]*--house-line/);
  assert.match(spec, /History search is house leftover/);
  const historyExtras = history.slice(
    history.lastIndexOf('<details', history.indexOf('history-show-all')),
    history.indexOf('house-show-all-body') + 80
  );
  assert.match(historyExtras, /house-card group/);
  assert.match(historyExtras, /house-show-all-body/);
  assert.match(historyExtras, /data-testid="history-show-all"/);
  assert.doesNotMatch(historyExtras, /border-t-2/);
  assert.match(css, /\.house-history \.house-show-all-body \{[^}]*--house-line/);
  assert.match(spec, /History Show all extras is house leftover/);
  const historyRoute = stripComments(read('app/(app)/history/page.tsx'));
  assert.doesNotMatch(historyRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(historyRoute, /import \{ HistoryPage \}/);
  assert.match(spec, /History list first paint is house leftover/);
  const reentry = read('src/components/today/TodayReentryCard.tsx');
  const plannedMiss = read('src/components/today/TodayPlannedMissPrompt.tsx');
  assert.match(reentry, /house-lede house-reentry/);
  assert.doesNotMatch(reentry, /poster-sub/);
  assert.match(plannedMiss, /house-reentry/);
  assert.match(plannedMiss, /house-lede/);
  assert.match(plannedMiss, /house-btn house-btn-ghost min-h-\[44px\] tap-target/);
  assert.doesNotMatch(plannedMiss, /poster-sub/);
  assert.doesNotMatch(plannedMiss, /text-primary/);
  assert.match(css, /\.house-reentry \{[^}]*margin-top:\s*16px/);
  assert.match(spec, /Today Start quiet offers are house leftover/);
  const coach = read('src/page-components/CoachPage.tsx');
  assert.match(coach, /className="house-plan max-w-2xl pb-24"/);
  assert.match(coach, /className="house-empty"/);
  assert.match(coach, /data-testid="coach-generate-dock"/);
  assert.match(coach, /generate\(\)/);
  const generateDock = coach.slice(
    Math.max(0, coach.indexOf('house-generate-dock') - 80),
    coach.indexOf('coach-generate-dock') + 80
  );
  assert.match(generateDock, /house-generate-dock/);
  assert.match(generateDock, /house-kicker/);
  assert.match(generateDock, /house-lede/);
  assert.match(generateDock, /house-btn house-btn-primary primary-action min-h-\[52px\] w-full tap-target/);
  assert.doesNotMatch(generateDock, /poster-field/);
  assert.doesNotMatch(generateDock, /poster-kicker/);
  assert.doesNotMatch(generateDock, /uppercase tracking/);
  assert.match(css, /\.house-generate-dock \.house-lede \{[^}]*font-size:\s*14px/);
  assert.match(spec, /Coach generate dock is house leftover/);
  const nextDayCite = read('src/components/coach/CoachNextDayCite.tsx');
  const nextDayEmpty = nextDayCite.slice(
    Math.max(0, nextDayCite.indexOf('if (!cite)') - 40),
    nextDayCite.indexOf('const canStartLogs')
  );
  assert.match(nextDayEmpty, /house-card house-next-day/);
  assert.match(nextDayEmpty, /house-kicker/);
  assert.match(nextDayEmpty, /house-lede/);
  assert.match(nextDayEmpty, /data-testid="coach-next-day-empty"/);
  assert.doesNotMatch(nextDayEmpty, /border-2/);
  assert.doesNotMatch(nextDayEmpty, /eyebrow/);
  const nextDayFilledAt = nextDayCite.indexOf('house-next-day-name');
  const nextDayFilled = nextDayCite.slice(
    Math.max(0, nextDayCite.lastIndexOf('house-card house-next-day', nextDayFilledAt) - 40),
    nextDayCite.indexOf('coach-next-day-start') + 80
  );
  assert.match(nextDayFilled, /house-card house-next-day/);
  assert.match(nextDayFilled, /house-btn house-btn-ghost min-h-\[44px\] w-full tap-target/);
  assert.doesNotMatch(nextDayFilled, /house-btn-primary/);
  assert.doesNotMatch(nextDayFilled, /primary-action/);
  assert.doesNotMatch(nextDayFilled, /<Button[\s>]/);
  assert.doesNotMatch(nextDayFilled, /border-2/);
  assert.doesNotMatch(nextDayFilled, /eyebrow/);
  assert.match(css, /\.house-next-day \{[^}]*padding:\s*16px 18px/);
  assert.match(spec, /Coach next-day cite is house leftover/);
  const weekDose = coach.slice(
    Math.max(0, coach.indexOf('coach-week-dose') - 80),
    coach.indexOf('coach-week-dose') + 40
  );
  assert.match(weekDose, /house-lede house-week-dose/);
  assert.doesNotMatch(weekDose, /text-muted-foreground/);
  assert.match(css, /\.house-week-dose \{[^}]*font-size:\s*14px/);
  assert.match(spec, /Coach week dose is house leftover/);
  const sessionCard = read('src/components/coach/PlanSessionCard.tsx');
  assert.match(sessionCard, /house-card house-session/);
  assert.match(
    sessionCard,
    /house-btn house-btn-primary primary-action min-h-\[44px\] w-full tap-target/
  );
  assert.match(sessionCard, /house-btn house-btn-ghost min-h-\[44px\] w-full tap-target/);
  assert.match(sessionCard, /house-state/);
  assert.match(sessionCard, /border-s-primary/);
  assert.doesNotMatch(sessionCard, /content-card/);
  assert.doesNotMatch(sessionCard, /<Card[\s>]/);
  assert.doesNotMatch(sessionCard, /<Badge[\s>]/);
  assert.doesNotMatch(sessionCard, /<Button[\s>]/);
  assert.doesNotMatch(sessionCard, /accent-poster/);
  assert.match(css, /\.house-session \{[^}]*padding:\s*16px 18px/);
  assert.match(spec, /Coach session card is house leftover/);
  const sessionLift = read('src/components/coach/PlanExerciseLine.tsx');
  assert.match(sessionLift, /house-session-lift/);
  assert.match(sessionLift, /house-btn house-btn-ghost house-session-lift-swap min-h-\[44px\] tap-target/);
  assert.doesNotMatch(sessionLift, /border-b border-border/);
  assert.doesNotMatch(sessionLift, /text-primary hover:underline/);
  assert.doesNotMatch(sessionLift, /accent-poster/);
  assert.match(css, /\.house-session-lift \{[^}]*--house-line/);
  assert.match(spec, /Coach session lift is house leftover/);
  const liveVoice = read('src/components/coach/CoachLiveVoice.tsx');
  const liveWrap = liveVoice.slice(
    Math.max(0, liveVoice.indexOf('coach-live-voice') - 80),
    liveVoice.indexOf('coach-live-talk') + 80
  );
  assert.match(liveWrap, /house-card house-live-voice/);
  assert.match(liveWrap, /house-kicker/);
  assert.match(liveWrap, /house-lede/);
  assert.match(liveWrap, /house-btn house-live-talk min-h-\[72px\] tap-target/);
  assert.doesNotMatch(liveWrap, /primary-action/);
  assert.doesNotMatch(liveWrap, /house-btn-primary/);
  assert.doesNotMatch(liveWrap, /eyebrow text-primary/);
  assert.doesNotMatch(liveWrap, /border-2/);
  assert.doesNotMatch(liveWrap, /<Button[\s>]/);
  assert.doesNotMatch(liveVoice, /accent-poster/);
  assert.match(css, /\.house-live-talk \{[^}]*min-height:\s*72px/);
  assert.match(spec, /Coach live voice is house leftover/);
  const adaptBanner = read('src/components/coach/CoachAdaptBanner.tsx');
  const adaptWrap = adaptBanner.slice(
    Math.max(0, adaptBanner.indexOf('coach-adapt-banner') - 160),
    adaptBanner.indexOf('coach-adapt-banner') + 80
  );
  assert.match(adaptWrap, /house-adapt/);
  assert.match(adaptWrap, /house-kicker/);
  assert.doesNotMatch(adaptWrap, /accent-poster/);
  assert.doesNotMatch(adaptWrap, /eyebrow/);
  assert.doesNotMatch(adaptBanner, /uppercase tracking/);
  assert.match(css, /\.house-adapt \{[^}]*--house-ink/);
  assert.match(spec, /Coach adapt banner is house leftover/);
  const coachExtras = coach.slice(
    coach.lastIndexOf('<details', coach.indexOf('coach-show-all')),
    coach.indexOf('<CoachLoadBand') + 40
  );
  assert.match(coachExtras, /house-card group/);
  assert.match(coachExtras, /house-show-all-body/);
  assert.match(coachExtras, /CoachVoiceCard/);
  assert.match(coachExtras, /CoachLoadBand/);
  assert.match(coachExtras, /CoachLogCite/);
  assert.match(coachExtras, /CoachManageSheet/);
  assert.doesNotMatch(coachExtras, /content-card/);
  assert.doesNotMatch(coachExtras, /border-t-2/);
  assert.doesNotMatch(coachExtras, /border-2/);
  assert.match(css, /\.house-plan \.house-show-all-body \{[^}]*--house-line/);
  assert.match(spec, /Coach Show all extras is house leftover/);
  const coachRoute = stripComments(read('app/(app)/coach/page.tsx'));
  assert.doesNotMatch(coachRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(coachRoute, /import \{ CoachPage \}/);
  assert.match(coachRoute, /askExerciseId/);
  assert.match(spec, /Coach first paint is house leftover/);
  const weekStrip = read('src/components/coach/WeekStrip.tsx');
  const landingDemo = read('src/components/landing/CoachAdaptDemo.tsx');
  const parkedToday = read('src/components/coach/TodayCoachWeekStrip.tsx');
  assert.equal((coach.match(/<WeekStrip house\b/g) || []).length, 2);
  assert.match(weekStrip, /house-week-strip/);
  assert.match(weekStrip, /house-week-cell/);
  assert.match(weekStrip, /border-\[hsl\(var\(--accent-poster\)\)\]/);
  assert.doesNotMatch(landingDemo, /<WeekStrip house\b/);
  assert.doesNotMatch(parkedToday, /<WeekStrip house\b/);
  assert.match(landingDemo, /<WeekStrip/);
  assert.match(css, /\.house-week-cell\.is-today \{[^}]*--house-ink/);
  assert.doesNotMatch(css, /\.house-week-cell[^}]*accent-poster/);
  assert.match(spec, /Coach week strip is house leftover/);
  const builder = read('src/page-components/BuilderPage.tsx');
  assert.match(builder, /className="house-builder"/);
  assert.match(builder, /house-btn-primary primary-action/);
  assert.match(builder, /startBlank/);
  assert.match(builder, /house-empty/);
  const builderExtras = builder.slice(
    Math.max(0, builder.indexOf('builder-show-all') - 80),
    builder.indexOf('step === 2')
  );
  assert.match(builderExtras, /house-show-all-body/);
  assert.match(builderExtras, /ProgramTemplatesPanel/);
  assert.match(builderExtras, /house-kicker/);
  assert.match(builderExtras, /house-lede/);
  assert.match(builderExtras, /house-state/);
  assert.match(builderExtras, /data-testid="builder-show-all"/);
  assert.doesNotMatch(builderExtras, /content-card/);
  assert.doesNotMatch(builderExtras, /border-t-2/);
  assert.doesNotMatch(builderExtras, /border-2/);
  assert.doesNotMatch(builderExtras, /<Badge/);
  assert.doesNotMatch(builderExtras, /<Layers/);
  assert.match(css, /\.house-builder \.house-show-all-body \{[^}]*--house-line/);
  assert.match(spec, /Builder Show all extras is house leftover/);
  const builderRoute = stripComments(read('app/(app)/builder/page.tsx'));
  assert.doesNotMatch(builderRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(builderRoute, /import \{ BuilderPage \}/);
  assert.match(spec, /Builder first paint is house leftover/);
  assert.match(css, /\.house-builder \.house-item/);
  const accountRoute = stripComments(read('app/(app)/account/page.tsx'));
  assert.doesNotMatch(accountRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(accountRoute, /import \{ AccountPage \}/);
  assert.match(accountRoute, /initialAuthError/);
  const account = read('src/page-components/AccountPage.tsx');
  assert.match(account, /className="house-account"/);
  assert.doesNotMatch(stripComments(account), /useSearchParams/);
  assert.match(account, /ProfileAccountCard/);
  assert.match(account, /ProfileRemindersCard/);
  assert.match(account, /ProfilePreferencesCard/);
  assert.match(account, /className="house-card space-y-2"/);
  assert.match(account, /className="house-card group"/);
  assert.match(account, /house-btn house-btn-ghost/);
  assert.match(account, /href="\/explore"/);
  assert.doesNotMatch(account, /eyebrow text-primary/);
  assert.doesNotMatch(account, /<Card[\s>]/);
  assert.match(css, /\.house-account \.bg-card/);
  assert.match(spec, /Account leftover/);
  assert.match(spec, /Account first paint is house leftover/);
  const hoodRoute = stripComments(read('app/(app)/account/under-the-hood/page.tsx'));
  assert.doesNotMatch(hoodRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(hoodRoute, /import \{ UnderTheHoodPage \}/);
  assert.match(spec, /Under the Hood first paint is house leftover/);
  const visibilityRoute = stripComments(read('app/(app)/account/transparency/page.tsx'));
  assert.doesNotMatch(visibilityRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(visibilityRoute, /import \{ TransparencyPage \}/);
  assert.match(spec, /Visibility first paint is house leftover/);
  const leaderboardRoute = stripComments(read('app/(app)/leaderboard/page.tsx'));
  assert.doesNotMatch(leaderboardRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(leaderboardRoute, /import \{ LeaderboardPage \}/);
  assert.match(leaderboardRoute, /initialBoard/);
  assert.match(spec, /Leaderboard first paint is house leftover/);
  const benchmarksRoute = stripComments(read('app/(app)/benchmarks/page.tsx'));
  assert.doesNotMatch(benchmarksRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(benchmarksRoute, /import \{ BenchmarksPage \}/);
  assert.match(spec, /Benchmarks first paint is house leftover/);
  const bundleRoute = stripComments(read('app/bundle/page.tsx'));
  assert.doesNotMatch(bundleRoute, /RouteLoading|Suspense/);
  assert.match(bundleRoute, /import \{ BundlePage \}/);
  assert.match(bundleRoute, /initialCheckout/);
  assert.match(spec, /Super Bundle first paint is house leftover/);
  const moveRoute = stripComments(read('app/(app)/move/page.tsx'));
  assert.doesNotMatch(moveRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(moveRoute, /import \{ MovePage \}/);
  assert.match(moveRoute, /initialCollection/);
  assert.match(spec, /Move first paint is house leftover/);
  const mindRoute = stripComments(read('app/(app)/mind/page.tsx'));
  assert.doesNotMatch(mindRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(mindRoute, /import \{ MindPage \}/);
  assert.match(mindRoute, /initialCollection/);
  assert.match(spec, /Mind first paint is house leftover/);
  const learnRoute = stripComments(read('app/(app)/learn/page.tsx'));
  assert.doesNotMatch(learnRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(learnRoute, /import \{ LearnPage \}/);
  assert.match(learnRoute, /initialPath/);
  assert.match(spec, /Learn first paint is house leftover/);
  const guidebookRoute = stripComments(read('app/(app)/learn/guide/page.tsx'));
  assert.doesNotMatch(guidebookRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(guidebookRoute, /import \{ GuidebookIndexPage \}/);
  assert.match(spec, /Guidebook first paint is house leftover/);
  const guideChapterRoute = stripComments(read('app/(app)/learn/guide/[chapterId]/page.tsx'));
  assert.doesNotMatch(guideChapterRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(guideChapterRoute, /import \{ GuidebookChapterPage \}/);
  assert.match(spec, /Guide chapter first paint is house leftover/);
  const courseRoute = stripComments(read('app/(app)/learn/course/page.tsx'));
  assert.doesNotMatch(courseRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(courseRoute, /import \{ LearnCoursePage \}/);
  assert.match(courseRoute, /initialChapter/);
  assert.match(spec, /Course first paint is house leftover/);
  assert.match(spec, /12px rows, selected `#eee`/);
  assert.match(spec, /stacked 13px muted rows/);
  const sidecar = stripComments(read('src/components/house/AccountSidecar.tsx'));
  assert.match(sidecar, /href: '\/account'/);
  assert.match(sidecar, /href: '\/profile'/);
  assert.doesNotMatch(sidecar, /href: '\/history'/);
  assert.doesNotMatch(sidecar, /href: '\/coach'/);
  assert.doesNotMatch(sidecar, /href: '\/server'/);
  const trainSide = stripComments(read('src/components/house/TrainSidecar.tsx'));
  assert.match(trainSide, /house-sidecar/);
  assert.match(trainSide, /composeSidecarWorkout/);
  assert.doesNotMatch(trainSide, /if \(!workout\)/);
  assert.doesNotMatch(trainSide, /activeEmptyExercises/);
  assert.match(trainSide, /startRest/);
  assert.doesNotMatch(trainSide, /href: '\/history'/);
  assert.doesNotMatch(trainSide, /href: '\/coach'/);
  assert.doesNotMatch(trainSide, /href: '\/server'/);
  assert.match(spec, /History stays on Home/);
  const profileRoute = stripComments(read('app/(app)/profile/page.tsx'));
  assert.doesNotMatch(profileRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(profileRoute, /import \{ ProfilePage \}/);
  const profile = read('src/page-components/ProfilePage.tsx');
  assert.match(profile, /className="house-profile"/);
  assert.match(profile, /house-btn house-btn-ghost/);
  assert.match(spec, /You first paint is house leftover/);
  const fuel = read('src/page-components/NutritionPage.tsx');
  assert.match(fuel, /className="house-fuel max-w-3xl pb-8"/);
  assert.match(fuel, /id="fuel-log"/);
  assert.match(fuel, /className="house-card group"/);
  const notepad = read('src/components/nutrition/FuelQuickLogPanel.tsx');
  const notepadSlice = notepad.slice(
    notepad.indexOf('data-testid="fuel-notepad"'),
    notepad.indexOf('</section>')
  );
  assert.match(notepad, /house-card house-fuel-notepad/);
  assert.match(notepad, /house-fuel-notepad-name/);
  assert.match(notepad, /house-btn house-btn-ghost min-h-\[44px\] tap-target/);
  assert.match(notepad, /house-state min-h-\[44px\] tap-target/);
  assert.match(notepad, /className="house-field"/);
  assert.match(notepadSlice, /data-testid="fuel-notepad"/);
  assert.doesNotMatch(notepadSlice, /<Button[\s>]/);
  assert.doesNotMatch(notepadSlice, /<Input[\s>]/);
  assert.doesNotMatch(notepadSlice, /focus:ring-2/);
  assert.doesNotMatch(notepadSlice, /border-2/);
  assert.doesNotMatch(notepadSlice, /house-btn-primary/);
  assert.doesNotMatch(notepadSlice, /primary-action/);
  assert.doesNotMatch(notepadSlice, /text-primary/);
  assert.match(css, /\.house-fuel \.house-fuel-notepad \.house-field \{[^}]*--house-line/);
  assert.match(css, /\.house-fuel \.house-state\.is-on \{[^}]*--house-selected/);
  assert.match(spec, /Fuel first-paint notepad is house leftover/);
  const todayLog = read('src/components/nutrition/FuelTodayLogCard.tsx');
  assert.match(todayLog, /house-card house-fuel-today/);
  assert.match(todayLog, /house-fuel-today-name/);
  assert.match(todayLog, /house-btn house-btn-ghost min-h-\[44px\] tap-target/);
  assert.match(todayLog, /data-testid="fuel-today-log"/);
  assert.doesNotMatch(todayLog, /<Card[\s>]/);
  assert.doesNotMatch(todayLog, /<Button[\s>]/);
  assert.doesNotMatch(todayLog, /border-2/);
  assert.doesNotMatch(todayLog, /text-primary/);
  assert.doesNotMatch(todayLog, /house-btn-primary/);
  assert.doesNotMatch(todayLog, /primary-action/);
  assert.match(css, /\.house-fuel \.house-fuel-today \{[^}]*--house-/);
  assert.match(css, /\.house-fuel \.house-fuel-meal \{[^}]*--house-line/);
  assert.match(spec, /Fuel first-paint today log is house leftover/);
  const macro = read('src/components/nutrition/FuelMacroOverview.tsx');
  assert.match(macro, /house-card house-fuel-macro/);
  assert.match(macro, /house-fuel-macro-num/);
  assert.match(macro, /house-kicker/);
  assert.match(macro, /data-testid="fuel-macro"/);
  assert.doesNotMatch(macro, /<Card[\s>]/);
  assert.doesNotMatch(macro, /uppercase tracking/);
  assert.doesNotMatch(macro, /text-primary/);
  assert.doesNotMatch(macro, /house-btn-primary/);
  assert.doesNotMatch(macro, /primary-action/);
  assert.match(css, /\.house-fuel \.house-fuel-macro \{[^}]*--house-ink/);
  assert.match(spec, /Fuel first-paint remaining is house leftover/);
  const fuelRoute = stripComments(read('app/(app)/nutrition/page.tsx'));
  assert.doesNotMatch(fuelRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(fuelRoute, /import \{ NutritionPage \}/);
  assert.match(spec, /Fuel first paint is house leftover/);
  const move = read('src/page-components/MovePage.tsx');
  assert.match(move, /className="house-move"/);
  const moveFlows = move.slice(
    move.indexOf('const renderFlowGrid'),
    move.indexOf('premium && filteredPremium')
  );
  assert.match(moveFlows, /house-collections/);
  assert.match(moveFlows, /house-state shrink-0 tap-target/);
  assert.match(moveFlows, /house-card house-flow/);
  assert.match(moveFlows, /house-flow-name/);
  assert.match(moveFlows, /house-btn house-btn-ghost min-h-\[44px\] tap-target/);
  assert.match(moveFlows, /defaultValue: 'Start Flow'/);
  assert.doesNotMatch(moveFlows, /<Card[\s>]/);
  assert.doesNotMatch(moveFlows, /<Button[\s>]/);
  assert.doesNotMatch(moveFlows, /content-card/);
  assert.doesNotMatch(moveFlows, /uppercase tracking/);
  assert.doesNotMatch(moveFlows, /hover:border-primary/);
  assert.doesNotMatch(moveFlows, /house-btn-primary/);
  assert.doesNotMatch(moveFlows, /text-primary/);
  assert.match(css, /\.house-move \.house-flow \{[^}]*--house-/);
  assert.match(css, /\.house-move \.house-state\.is-on \{[^}]*--house-selected/);
  assert.match(spec, /Move first-paint flow list is house leftover/);
  const quietMove = read('src/components/move/QuietMoveLogCard.tsx');
  assert.match(quietMove, /house-card house-quiet-move/);
  assert.match(quietMove, /house-quiet-move-name/);
  assert.match(quietMove, /house-btn house-btn-ghost min-h-\[44px\] tap-target/);
  assert.match(quietMove, /house-state tap-target/);
  assert.match(quietMove, /className="house-field"/);
  assert.doesNotMatch(quietMove, /<Button[\s>]/);
  assert.doesNotMatch(quietMove, /<Input[\s>]/);
  assert.doesNotMatch(quietMove, /border-2/);
  assert.doesNotMatch(quietMove, /house-btn-primary/);
  assert.doesNotMatch(quietMove, /primary-action/);
  assert.match(css, /\.house-move \.house-quiet-move \.house-field \{[^}]*--house-line/);
  assert.match(spec, /Move first-paint quiet log is house leftover/);
  assert.match(read('src/page-components/MindPage.tsx'), /className="house-mind"/);
  const mindCheckIn = read('src/components/pillars/DailyCheckIn.tsx');
  assert.match(mindCheckIn, /house-card house-checkin/);
  assert.match(mindCheckIn, /house-checkin-name/);
  assert.match(mindCheckIn, /house-checkin-scale/);
  assert.match(mindCheckIn, /house-checkin-tick min-h-\[44px\] tap-target/);
  assert.match(mindCheckIn, /house-btn house-btn-primary min-h-\[44px\] w-full tap-target/);
  assert.match(mindCheckIn, /className="house-field"/);
  assert.doesNotMatch(mindCheckIn, /<Card[\s>]/);
  assert.doesNotMatch(mindCheckIn, /<Button[\s>]/);
  assert.doesNotMatch(mindCheckIn, /primary-action/);
  assert.doesNotMatch(mindCheckIn, /text-primary/);
  assert.doesNotMatch(mindCheckIn, /bg-foreground/);
  assert.match(css, /\.house-mind \.house-checkin-tick\.is-on \{[^}]*--house-press/);
  assert.match(spec, /Mind first-paint check-in is house leftover/);
  const breathe = read('src/components/pillars/BreathingTimer.tsx');
  assert.match(breathe, /house-card house-breathe/);
  assert.match(breathe, /house-breathe-square/);
  assert.match(breathe, /house-btn house-btn-ghost min-h-\[44px\] tap-target/);
  assert.match(breathe, /house-state tap-target/);
  assert.doesNotMatch(breathe, /<Card[\s>]/);
  assert.doesNotMatch(breathe, /<Button[\s>]/);
  assert.doesNotMatch(breathe, /bg-neutral-900/);
  assert.doesNotMatch(breathe, /text-primary/);
  assert.doesNotMatch(breathe, /house-btn-primary/);
  assert.doesNotMatch(breathe, /primary-action/);
  assert.match(css, /\.house-mind \.house-breathe-square \{[^}]*--house-ink/);
  assert.match(css, /\.house-mind \.house-state\.is-on \{[^}]*--house-selected/);
  assert.match(spec, /Mind first-paint breathe is house leftover/);
  assert.match(read('src/page-components/TrackPage.tsx'), /className="house-track"/);
  const metrics = read('src/components/track/BodyMetricsCard.tsx');
  assert.match(metrics, /house-card house-metrics/);
  assert.match(metrics, /house-metrics-name/);
  assert.match(metrics, /house-btn house-btn-ghost min-h-\[44px\] tap-target/);
  assert.match(metrics, /data-testid="quiet-track-log"/);
  assert.match(metrics, /house-state tap-target/);
  assert.doesNotMatch(metrics, /<Card[\s>]/);
  assert.doesNotMatch(metrics, /<Button[\s>]/);
  assert.doesNotMatch(metrics, /content-card/);
  assert.doesNotMatch(metrics, /uppercase tracking/);
  assert.doesNotMatch(metrics, /house-btn-primary/);
  assert.doesNotMatch(metrics, /text-primary/);
  assert.doesNotMatch(metrics, /primary-action/);
  assert.match(css, /\.house-track \.house-stat \{[^}]*--house-line/);
  assert.match(css, /\.house-track \.house-state\.is-on \{[^}]*--house-selected/);
  assert.match(spec, /Track first-paint metrics is house leftover/);
  const trackRoute = stripComments(read('app/(app)/track/page.tsx'));
  assert.doesNotMatch(trackRoute, /dynamic\(|RouteLoading|Suspense/);
  assert.match(trackRoute, /import \{ TrackPage \}/);
  assert.match(spec, /Track first paint is house leftover/);
  assert.match(read('src/page-components/LearnPage.tsx'), /className="house-learn"/);
  const learnIntro = read('src/components/learn/QuietLearnIntroCard.tsx');
  assert.match(learnIntro, /house-card house-learn-intro/);
  assert.match(learnIntro, /house-learn-name/);
  assert.match(learnIntro, /house-btn house-btn-ghost min-h-\[44px\] tap-target/);
  assert.match(learnIntro, /data-testid="quiet-learn-intro"/);
  assert.doesNotMatch(learnIntro, /<Button[\s>]/);
  assert.doesNotMatch(learnIntro, /border-2/);
  assert.doesNotMatch(learnIntro, /uppercase tracking/);
  assert.doesNotMatch(learnIntro, /house-btn-primary/);
  assert.doesNotMatch(learnIntro, /primary-action/);
  assert.match(css, /\.house-learn \.house-learn-points \.house-lede \{[^}]*--house-line/);
  assert.match(spec, /Learn first-paint intro is house leftover/);
  assert.match(read('src/page-components/LearnCoursePage.tsx'), /className="house-learn"/);
  const feedback = read('src/page-components/FeedbackPage.tsx');
  assert.match(feedback, /className="house-feedback"/);
  assert.match(feedback, /className="house-card space-y-6"/);
  assert.match(feedback, /house-btn house-btn-primary primary-action/);
  assert.match(feedback, /InfoPageShell/);
  assert.match(feedback, /composeFeedbackNote\(/);
  assert.doesNotMatch(feedback, /content-card/);
  assert.match(css, /\.house-feedback form\.house-card/);
  assert.match(css, /\.house-feedback textarea/);
  const garage = read('src/page-components/ServerPage.tsx');
  assert.match(garage, /className="house-garage p-6"/);
  assert.match(garage, /className="house-garage space-y-4"/);
  const moreNav = read('src/components/house/houseNav.ts');
  assert.match(moreNav, /href: '\/feedback'/);
  assert.match(moreNav, /href: '\/server'/);
  assert.doesNotMatch(moreNav, /['"]\/explore['"]/);
  const explore = read('src/page-components/ExplorePlacesPage.tsx');
  assert.match(explore, /className="house-explore"/);
  assert.match(explore, /className="house-list"/);
  assert.match(explore, /className="house-item/);
  assert.match(explore, /className="house-board/);
  assert.match(explore, /house-btn house-btn-primary/);
  assert.match(explore, /Not a shop/);
  assert.doesNotMatch(explore, /<Card[\s>]/);
  assert.doesNotMatch(explore, /bg-primary-fill/);
  assert.match(css, /\.house-explore \.house-board/);
  assert.match(spec, /Feedback leftover/);
  assert.match(spec, /Garage leftover/);
  assert.match(spec, /Explore leftover/);
  const assess = read('src/page-components/AssessmentsPage.tsx');
  assert.match(assess, /className="house-assess"/);
  assert.match(assess, /house-btn house-btn-primary primary-action/);
  assert.match(assess, /className="house-card space-y-4"/);
  assert.match(assess, /scoreParqAnswers/);
  assert.match(assess, /startWorkout\(/);
  assert.match(assess, /assessmentsEnFloor/);
  assert.doesNotMatch(assess, /defaultValue: item\.key/);
  assert.doesNotMatch(assess, /content-card/);
  assert.match(css, /\.house-assess/);
  assert.match(spec, /Assessment leftover/);
  const calc = read('src/page-components/CalculatorsPage.tsx');
  assert.match(calc, /className="house-calc"/);
  assert.match(calc, /className="house-card"/);
  assert.match(calc, /className="house-state"/);
  assert.match(calc, /OneRmCalculator/);
  assert.match(calc, /MacroCalculator/);
  assert.match(calc, /PlateCalculatorPanel/);
  assert.match(calc, /className="house-card group"/);
  assert.doesNotMatch(calc, /content-card/);
  assert.doesNotMatch(calc, /<Card[\s>]/);
  assert.match(account, /href="\/calculators"/);
  assert.doesNotMatch(moreNav, /['"]\/calculators['"]/);
  assert.match(css, /\.house-calc/);
  assert.match(spec, /Calculator leftover/);
  const coaching = read('src/page-components/CoachingPage.tsx');
  assert.match(coaching, /className="house-coaching"/);
  assert.match(coaching, /className="house-card space-y-4"/);
  assert.match(coaching, /house-btn house-btn-primary primary-action/);
  assert.match(coaching, /submitLead\(/);
  assert.doesNotMatch(coaching, /content-card/);
  assert.doesNotMatch(coaching, /<Card[\s>]/);
  assert.doesNotMatch(coaching, /<Button[\s>]/);
  assert.doesNotMatch(coaching, /font-display/);
  assert.doesNotMatch(moreNav, /['"]\/coaching['"]/);
  assert.match(css, /\.house-coaching/);
  assert.match(spec, /Human coaching leftover/);
  assert.match(spec, /Not Mission Coach/);
  const programs = read('src/page-components/ProgramsPage.tsx');
  assert.match(programs, /className="house-programs"/);
  assert.match(programs, /className="house-card space-y-3"/);
  assert.match(programs, /className=\{`house-state\$\{filterGoal === g\.value \? ' is-on' : ''\}`\}/);
  assert.match(programs, /programsEnFloor/);
  assert.match(programs, /UnlockButton/);
  assert.match(programs, /className="house-card group"/);
  assert.doesNotMatch(programs, /content-card/);
  assert.doesNotMatch(programs, /<Card[\s>]/);
  assert.doesNotMatch(programs, /<Button[\s>]/);
  assert.doesNotMatch(moreNav, /['"]\/programs['"]/);
  assert.match(css, /\.house-programs/);
  assert.match(spec, /Programs leftover/);
  const help = read('src/page-components/HelpPage.tsx');
  assert.match(help, /className="house-help"/);
  assert.match(help, /className="house-list"/);
  assert.match(help, /className="house-item"/);
  assert.match(help, /HELP_FAQ/);
  assert.match(help, /data-testid="help-faq"/);
  assert.doesNotMatch(help, /InfoSection/);
  assert.doesNotMatch(moreNav, /['"]\/help['"]/);
  assert.match(css, /\.house-help/);
  assert.match(spec, /Help leftover/);
  const cookies = read('src/page-components/CookiesPage.tsx');
  assert.match(cookies, /className="house-cookies"/);
  assert.match(cookies, /className="house-card space-y-3"/);
  assert.match(cookies, /STORAGE_INVENTORY/);
  assert.match(cookies, /scrollable-region-focusable/);
  assert.doesNotMatch(cookies, /InfoSection/);
  assert.doesNotMatch(cookies, /border-b-2/);
  assert.doesNotMatch(moreNav, /['"]\/cookies['"]/);
  assert.match(css, /\.house-cookies/);
  assert.match(spec, /Cookies leftover/);
  const privacy = read('src/page-components/PrivacyPage.tsx');
  assert.match(privacy, /className="house-privacy"/);
  assert.match(privacy, /className="house-card space-y-3"/);
  assert.match(privacy, /house-privacy-jump/);
  assert.match(privacy, /infoEnFloor/);
  assert.match(privacy, /PRIVACY_SECTIONS/);
  assert.doesNotMatch(privacy, /InfoSection/);
  assert.doesNotMatch(moreNav, /['"]\/privacy['"]/);
  assert.match(css, /\.house-privacy/);
  assert.match(spec, /Privacy leftover/);
  const terms = read('src/page-components/TermsPage.tsx');
  assert.match(terms, /className="house-terms"/);
  assert.match(terms, /className="house-card space-y-3"/);
  assert.match(terms, /house-terms-jump/);
  assert.match(terms, /infoEnFloor/);
  assert.match(terms, /TERM_SECTIONS/);
  assert.match(terms, /eu-consumers/);
  assert.doesNotMatch(terms, /InfoSection/);
  assert.doesNotMatch(moreNav, /['"]\/terms['"]/);
  assert.match(css, /\.house-terms/);
  assert.match(spec, /Terms leftover/);
  const refunds = read('src/page-components/RefundsPage.tsx');
  assert.match(refunds, /className="house-refunds"/);
  assert.match(refunds, /className="house-card space-y-3"/);
  assert.match(refunds, /house-refunds-jump/);
  assert.match(refunds, /infoEnFloor/);
  assert.match(refunds, /REFUND_SECTIONS/);
  assert.match(refunds, /subscriptions/);
  assert.match(refunds, /lifetime/);
  assert.match(refunds, /The free logger never needs a refund|infoRefundsIntro/);
  assert.doesNotMatch(refunds, /InfoSection/);
  assert.doesNotMatch(refunds, /Stripe Customer Portal/);
  assert.doesNotMatch(moreNav, /['"]\/refunds['"]/);
  assert.match(css, /\.house-refunds/);
  assert.match(spec, /Refunds leftover/);
  const dmca = read('src/page-components/DmcaPage.tsx');
  assert.match(dmca, /className="house-dmca"/);
  assert.match(dmca, /className="house-card space-y-3"/);
  assert.match(dmca, /house-dmca-jump/);
  assert.match(dmca, /infoEnFloor/);
  assert.match(dmca, /DMCA_SECTIONS/);
  assert.match(dmca, /id: 'agent'/);
  assert.match(dmca, /id: 'notice'/);
  assert.match(dmca, /id: 'counter'/);
  assert.match(dmca, /Copyright Office designation is filed|infoDmcaAgentBody/);
  assert.doesNotMatch(dmca, /InfoSection/);
  assert.doesNotMatch(moreNav, /['"]\/dmca['"]/);
  assert.match(css, /\.house-dmca/);
  assert.match(spec, /DMCA leftover/);
  const usage = read('src/page-components/UsagePolicyPage.tsx');
  assert.match(usage, /className="house-usage"/);
  assert.match(usage, /className="house-card space-y-3"/);
  assert.match(usage, /house-usage-jump/);
  assert.match(usage, /infoEnFloor/);
  assert.match(usage, /USAGE_SECTIONS/);
  assert.match(usage, /id: 'purpose'/);
  assert.match(usage, /id: 'prohibited'/);
  assert.match(usage, /id: 'self-host'/);
  assert.match(usage, /href="\/terms"/);
  assert.match(usage, /href="\/regions"/);
  assert.doesNotMatch(usage, /InfoSection/);
  assert.doesNotMatch(moreNav, /['"]\/usage['"]/);
  assert.match(css, /\.house-usage/);
  assert.match(spec, /Usage leftover/);
  const regions = read('src/page-components/SupportedRegionsPage.tsx');
  assert.match(regions, /className="house-regions"/);
  assert.match(regions, /className="house-card space-y-3"/);
  assert.match(regions, /house-regions-jump/);
  assert.match(regions, /infoEnFloor/);
  assert.match(regions, /REGION_SECTIONS/);
  assert.match(regions, /id: 'summary'/);
  assert.match(regions, /id: 'not-supported'/);
  assert.match(regions, /EUROPE_UNSUPPORTED_ISO2/);
  assert.match(regions, /REGION_POLICY/);
  assert.match(regions, /href="\/terms"/);
  assert.match(regions, /href="\/service-terms"/);
  assert.doesNotMatch(regions, /InfoSection/);
  assert.doesNotMatch(regions, /border-2/);
  assert.doesNotMatch(moreNav, /['"]\/regions['"]/);
  assert.match(css, /\.house-regions/);
  assert.match(spec, /Regions leftover/);
  const service = read('src/page-components/ServiceTermsPage.tsx');
  assert.match(service, /className="house-service-terms"/);
  assert.match(service, /className="house-card space-y-3"/);
  assert.match(service, /house-service-terms-jump/);
  assert.match(service, /infoEnFloor/);
  assert.match(service, /SERVICE_SECTIONS/);
  assert.match(service, /id: 'scope'/);
  assert.match(service, /id: 'free-core'/);
  assert.match(service, /id: 'super-bundle'/);
  assert.match(service, /id: 'human-coach'/);
  assert.match(service, /href="\/refunds"/);
  assert.match(service, /href="\/regions"/);
  assert.doesNotMatch(service, /InfoSection/);
  assert.doesNotMatch(moreNav, /['"]\/service-terms['"]/);
  assert.match(css, /\.house-service-terms/);
  assert.match(spec, /Service-terms leftover/);
  const a11y = read('src/page-components/AccessibilityPage.tsx');
  assert.match(a11y, /className="house-a11y"/);
  assert.match(a11y, /className="house-card space-y-3"/);
  assert.match(a11y, /house-a11y-jump/);
  assert.match(a11y, /infoEnFloor/);
  assert.match(a11y, /A11Y_SECTIONS/);
  assert.match(a11y, /id: 'commitment'/);
  assert.match(a11y, /id: 'measures'/);
  assert.match(a11y, /id: 'limitations'/);
  assert.match(a11y, /id: 'feedback'/);
  assert.match(a11y, /infoA11yMeasuresLi1/);
  assert.doesNotMatch(a11y, /InfoSection/);
  assert.doesNotMatch(moreNav, /['"]\/accessibility['"]/);
  assert.match(css, /\.house-a11y/);
  assert.match(spec, /Accessibility leftover/);
  const composeLive = read('src/page-components/ActiveWorkoutPage.tsx');
  assert.match(composeLive, /house-compose-live/);
  assert.match(composeLive, /className="house-lede"/);
  assert.match(composeLive, /className="house-btn min-h-\[44px\] w-full justify-start"/);
  assert.match(composeLive, /className="house-card group"/);
  assert.match(composeLive, /data-testid="active-show-all"/);
  assert.match(composeLive, /onLogSet=\{/);
  assert.doesNotMatch(composeLive, /border-y-2 border-border/);
  assert.doesNotMatch(composeLive, /<Button[\s>]/);
  assert.match(css, /\.house-compose-live details\.house-card/);
  const cues = read('src/components/workout/InSetCueList.tsx');
  assert.match(cues, /house-kicker/);
  assert.match(cues, /house-btn house-btn-ghost/);
  assert.match(cues, /data-testid="in-set-cues-skip"/);
  assert.match(cues, /data-testid="in-set-cues-more"/);
  assert.doesNotMatch(cues, /border-2 border-border/);
  assert.doesNotMatch(cues, /primary-action/);
  assert.match(spec, /Train compose/);
  assert.match(spec, /In-set cues are a kicker/);
  const setTable = read('src/components/workout/SetLogTable.tsx');
  assert.match(setTable, /house-state min-h-\[44px\] tap-target/);
  assert.match(setTable, /house-num min-h-\[44px\] w-full min-w-0 tap-target/);
  const logSet = setTable.slice(
    setTable.indexOf('data-testid="set-table-log-set"'),
    setTable.indexOf('data-testid="set-table-log-set"') + 360
  );
  assert.match(logSet, /house-btn house-btn-primary house-set-log/);
  assert.match(logSet, /primary-action/);
  assert.doesNotMatch(logSet, /accent-poster/);
  assert.match(css, /\.house-compose-live \.house-set-log \{[^}]*--house-press/);
  assert.match(spec, /Log set is house leftover/);
  const logConsole = read('src/components/workout/LogConsole.tsx');
  const consoleLogSet = logConsole.slice(
    logConsole.indexOf('data-testid="log-console-log-set"'),
    logConsole.indexOf('data-testid="log-console-log-set"') + 400
  );
  assert.match(consoleLogSet, /house-btn house-btn-primary house-set-log/);
  assert.match(consoleLogSet, /primary-action/);
  assert.doesNotMatch(consoleLogSet, /accent-poster/);
  assert.match(spec, /LogConsole Log set is house leftover/);
  const setHead = setTable.slice(setTable.indexOf('<thead>'), setTable.indexOf('</thead>'));
  assert.match(setHead, /house-set-head/);
  assert.doesNotMatch(setHead, /border-b-2/);
  assert.doesNotMatch(setHead, /uppercase/);
  assert.match(css, /\.house-compose-live \.house-set-head \{[^}]*text-transform:\s*none/);
  assert.match(spec, /Set table head is house leftover/);
  const setSideKicker = setTable.slice(
    setTable.indexOf('data-testid="set-table-side"') - 160,
    setTable.indexOf('data-testid="set-table-side"') + 80
  );
  assert.match(setSideKicker, /house-set-kicker/);
  assert.doesNotMatch(setSideKicker, /uppercase/);
  const workClock = setTable.slice(
    setTable.indexOf('data-testid="set-row-work-clock"'),
    setTable.indexOf('data-testid="set-row-work-clock-digits"')
  );
  assert.match(workClock, /house-set-kicker/);
  assert.doesNotMatch(workClock, /uppercase/);
  assert.match(css, /\.house-compose-live \.house-set-kicker \{[^}]*text-transform:\s*none/);
  assert.match(spec, /Set row kicker is house leftover/);
  const loggedCheck = setTable.slice(
    setTable.indexOf('data-testid="set-table-logged-check"') - 200,
    setTable.indexOf('data-testid="set-table-logged-check"') + 80
  );
  assert.match(loggedCheck, /house-set-check/);
  assert.doesNotMatch(loggedCheck, /text-primary/);
  assert.doesNotMatch(loggedCheck, /accent-poster/);
  assert.match(css, /\.house-compose-live \.house-set-check \{[^}]*--house-ink/);
  assert.match(spec, /Logged check is house leftover/);
  assert.match(setTable, /house-set-done/);
  assert.match(setTable, /house-set-done-mark/);
  assert.doesNotMatch(setTable, /bg-muted\/40/);
  assert.doesNotMatch(setTable, /border-s-primary/);
  assert.match(css, /\.house-compose-live tr\.house-set-done \{[^}]*--house-soft/);
  assert.match(css, /\.house-compose-live \.house-set-done-mark \{[^}]*--house-ink/);
  assert.match(spec, /Completed row is house leftover/);
  const plusLoadPrefix = setTable.slice(
    setTable.indexOf('{plusLoad ? ('),
    setTable.indexOf('<SetRowLoadField')
  );
  assert.match(plusLoadPrefix, /house-set-kicker/);
  assert.doesNotMatch(plusLoadPrefix, /uppercase/);
  assert.match(spec, /Plus-load prefix is house leftover/);
  const kindBadge = setTable.slice(
    setTable.indexOf("kind !== 'normal'"),
    setTable.indexOf('setKindLabelKey(kind)')
  );
  assert.match(kindBadge, /house-set-kicker/);
  assert.doesNotMatch(kindBadge, /uppercase/);
  assert.match(spec, /Kind badge is house leftover/);
  assert.doesNotMatch(setTable, /border-2 border-border/);
  assert.doesNotMatch(setTable, /focus:ring-2/);
  assert.doesNotMatch(
    setTable.slice(setTable.indexOf('function SetRowTagChips')),
    /accent-poster/
  );
  assert.match(css, /\.house-compose-live \.house-state\.is-on \{[^}]*--house-selected/);
  assert.match(css, /\.house-compose-live \.house-num \{[^}]*--house-line/);
  assert.match(
    css,
    /\.house-compose-live \.house-num:focus,\s*\.mw-house \.house-compose-live \.house-num:focus-visible \{[^}]*box-shadow:\s*none/
  );
  const footer = read('src/components/workout/ActiveExerciseFooter.tsx');
  assert.match(footer, /house-state min-h-\[44px\] tap-target/);
  assert.match(footer, /className="house-btn min-h-\[44px\] tap-target"/);
  assert.match(footer, /data-testid="active-add-set"/);
  assert.match(footer, /data-testid="active-start-rest"/);
  assert.doesNotMatch(footer, /<Button[\s>]/);
  assert.doesNotMatch(footer, /variant="outline"/);
  const restStrip = read('src/components/workout/ExerciseRestStrip.tsx');
  assert.match(restStrip, /house-state min-h-\[44px\] tap-target/);
  assert.match(restStrip, /house-kicker/);
  assert.doesNotMatch(restStrip, /accent-poster/);
  assert.doesNotMatch(restStrip, /border-2/);
  assert.match(spec, /Kind chips are house-state/);
  assert.match(spec, /Add Set is house-btn/);
  assert.match(spec, /Rest lanes are house-state/);
  assert.match(spec, /Number cells are house-num/);
  const rpe10 = read('src/components/workout/SetRpe10Select.tsx');
  const rir = read('src/components/workout/SetRirSelect.tsx');
  const tempo = read('src/components/workout/SetTempoField.tsx');
  const plates = read('src/components/workout/SetLogPlateLine.tsx');
  assert.match(rpe10, /house-num min-h-\[44px\] min-w-\[44px\] tap-target/);
  assert.match(rir, /house-num min-h-\[44px\] min-w-\[44px\] tap-target/);
  assert.match(tempo, /house-num min-h-\[44px\] w-\[4\.75rem\] tap-target/);
  assert.match(plates, /house-num min-h-\[44px\] w-12 min-w-\[44px\] tap-target/);
  assert.match(plates, /house-btn min-h-\[44px\] shrink-0 tap-target/);
  assert.match(plates, /data-testid="set-table-plates-skip"/);
  assert.doesNotMatch(rpe10, /border-2/);
  assert.doesNotMatch(rir, /border-2/);
  assert.doesNotMatch(tempo, /border-2/);
  assert.doesNotMatch(plates, /border-2/);
  assert.doesNotMatch(rpe10, /focus:ring-2/);
  assert.doesNotMatch(rir, /focus:ring-2/);
  assert.doesNotMatch(tempo, /focus:ring-2/);
  assert.doesNotMatch(plates, /focus:ring-2/);
  assert.doesNotMatch(plates, /hover:bg-muted/);
  assert.doesNotMatch(stripComments(rpe10), /accent-poster/);
  assert.doesNotMatch(stripComments(rir), /accent-poster/);
  assert.doesNotMatch(stripComments(tempo), /accent-poster/);
  assert.doesNotMatch(stripComments(plates), /accent-poster/);
  assert.match(css, /\.house-compose-live select\.house-num \{[^}]*padding-inline:\s*6px/);
  assert.match(spec, /Extra set cells are house-num/);
  assert.match(spec, /Plate skip is house-btn/);
  const nextCite = read('src/components/workout/SetLogNextCite.tsx');
  assert.match(nextCite, /data-testid="set-table-next-cite-skip"/);
  assert.match(nextCite, /house-btn min-h-\[44px\] shrink-0 tap-target/);
  assert.doesNotMatch(nextCite, /border-2/);
  assert.doesNotMatch(nextCite, /hover:bg-muted/);
  assert.doesNotMatch(nextCite, /house-btn-primary/);
  assert.doesNotMatch(stripComments(nextCite), /accent-poster/);
  assert.match(spec, /Next-cite Skip is house-btn/);
  const jot = read('src/components/workout/SessionJotField.tsx');
  assert.match(jot, /data-testid="session-notes"/);
  assert.match(jot, /house-jot/);
  assert.match(jot, /house-btn house-btn-ghost min-h-\[44px\] tap-target/);
  assert.match(jot, /house-field min-h-\[44px\] tap-target/);
  assert.doesNotMatch(jot, /border-2/);
  assert.doesNotMatch(jot, /focus-visible:ring-2/);
  assert.doesNotMatch(jot, /house-btn-primary/);
  const hr = read('src/components/workout/LiveHeartRate.tsx');
  assert.match(hr, /data-testid="live-heart-rate"/);
  assert.match(hr, /house-live-hr/);
  assert.match(hr, /house-btn min-h-\[44px\] tap-target/);
  assert.doesNotMatch(hr, /<Button/);
  assert.doesNotMatch(hr, /border-2/);
  assert.doesNotMatch(hr, /variant="outline"/);
  assert.doesNotMatch(hr, /house-btn-primary/);
  assert.match(composeLive, /house-show-all-body/);
  assert.doesNotMatch(composeLive, /border-t border-border/);
  assert.match(css, /\.house-compose-live \.house-show-all-body \{[^}]*--house-line/);
  assert.match(css, /\.house-compose-live \.house-live-hr \{[^}]*flex/);
  assert.match(spec, /Show-all extras are house leftover/);
  const restDock = read('src/components/workout/RestTimerBar.tsx');
  assert.match(restDock, /house-rest-dock/);
  assert.match(restDock, /data-testid="rest-skip"/);
  assert.match(restDock, /house-btn ms-auto min-h-\[44px\] min-w-\[5\.5rem\] tap-target/);
  assert.match(restDock, /house-rest-fill/);
  assert.doesNotMatch(restDock, /bg-neutral-900/);
  assert.doesNotMatch(restDock, /border-t-2/);
  assert.doesNotMatch(restDock, /bg-accent-400/);
  assert.doesNotMatch(restDock, /house-btn-primary/);
  assert.doesNotMatch(restDock, /accent-poster/);
  assert.match(css, /\.house-rest-dock \{[^}]*--house-paper/);
  assert.match(css, /\.house-rest-fill \{[^}]*--house-ink/);
  assert.match(spec, /Rest dock is house leftover/);
  const sessionChrome = read('src/components/workout/ActiveSessionChrome.tsx');
  assert.match(sessionChrome, /data-testid="active-finish"/);
  assert.match(sessionChrome, /className="house-btn min-h-\[44px\] shrink-0 tap-target"/);
  assert.match(sessionChrome, /data-testid="active-session-more"/);
  assert.match(sessionChrome, /house-btn house-btn-ghost/);
  assert.match(sessionChrome, /house-card house-session-more/);
  assert.match(sessionChrome, /HoldToConfirmButton/);
  const sessionHolds = sessionChrome.slice(sessionChrome.indexOf('onTakeOtherSession'));
  assert.match(sessionHolds, /chrome="house"/);
  assert.equal(
    (sessionHolds.match(/chrome="house"/g) ?? []).length,
    2,
    'Session more holds are house leftover (.1057)'
  );
  assert.match(sessionChrome, /data-testid="session-train-backfill"/);
  assert.doesNotMatch(sessionChrome, /house-btn-primary/);
  assert.doesNotMatch(sessionChrome, /border-2/);
  assert.doesNotMatch(sessionChrome, /<Button[\s>]/);
  assert.doesNotMatch(sessionChrome, /variant="outline"/);
  assert.match(css, /\.house-compose-chrome \{[^}]*--house-line/);
  assert.match(
    css,
    /\.house-session-more,\s*\.mw-house \.house-compose-live \.house-exercise-more,\s*\.mw-house \.house-compose-live \.house-set-options \{[^}]*--house-radius-sm/
  );
  assert.match(css, /\.house-exercise-more-foot \{[^}]*--house-line/);
  assert.match(spec, /Finish is house-btn, not filled/);
  assert.match(spec, /Session more is house leftover/);
  assert.match(spec, /Session more hold is house leftover/);
  const cueMe = read('src/components/speech/ActiveTrainCues.tsx');
  assert.match(cueMe, /house-btn house-btn-ghost min-h-\[44px\] w-full justify-start tap-target/);
  assert.match(cueMe, /data-testid="active-cue-me"/);
  assert.doesNotMatch(cueMe, /<Button[\s>]/);
  assert.doesNotMatch(cueMe, /border-2/);
  assert.doesNotMatch(cueMe, /variant="outline"/);
  assert.match(spec, /Cue me is house leftover/);
  const plateLoader = read('src/components/calculators/PlateCalculatorPanel.tsx');
  assert.match(plateLoader, /house-plates/);
  assert.match(plateLoader, /house-state min-h-\[44px\] tap-target/);
  assert.match(plateLoader, /house-plates-disc/);
  assert.match(plateLoader, /primary-action min-h-\[52px\] tap-target w-full/);
  assert.doesNotMatch(plateLoader, /border-2/);
  assert.doesNotMatch(plateLoader, /uppercase tracking/);
  assert.doesNotMatch(plateLoader, /bg-primary-fill/);
  assert.doesNotMatch(plateLoader, /<Button[\s>]/);
  assert.doesNotMatch(plateLoader, /<Card/);
  assert.doesNotMatch(plateLoader, /from '@\/components\/ui\/button'/);
  assert.doesNotMatch(plateLoader, /from '@\/components\/ui\/input'/);
  assert.doesNotMatch(plateLoader, /from '@\/components\/ui\/card'/);
  assert.match(css, /\.mw-house \.house-plates \.house-state\.is-on \{[^}]*--house-selected/);
  assert.match(spec, /Plate loader is house leftover/);
  const plateSheet = read('src/components/workout/PlateCalculatorSheet.tsx');
  assert.match(plateSheet, /mw-house house-plates-sheet/);
  assert.match(plateSheet, /PlateCalculatorPanel/);
  const skipHeader = read('src/components/workout/ActiveExerciseHeader.tsx');
  assert.match(skipHeader, /house-exercise-head/);
  assert.match(skipHeader, /house-exercise-title/);
  assert.doesNotMatch(skipHeader, /CardHeader|CardTitle/);
  assert.doesNotMatch(skipHeader, /<Badge/);
  assert.doesNotMatch(skipHeader, /from '@\/components\/ui\/badge'/);
  assert.doesNotMatch(skipHeader, /from '@\/components\/ui\/card'/);
  assert.match(css, /\.house-compose-live \.house-exercise-head \{[^}]*padding/);
  assert.match(spec, /Exercise head is house leftover/);
  const exerciseCard = read('src/components/workout/ActiveExerciseCard.tsx');
  assert.match(exerciseCard, /house-exercise-card/);
  assert.match(exerciseCard, /data-testid="active-exercise-card"/);
  assert.doesNotMatch(exerciseCard, /<Card[\s>]/);
  assert.doesNotMatch(exerciseCard, /CardContent/);
  assert.doesNotMatch(exerciseCard, /content-card/);
  assert.doesNotMatch(exerciseCard, /accent-poster/);
  assert.match(css, /\.house-compose-live \.house-exercise-card \{[^}]*--house-paper/);
  assert.match(spec, /Exercise card is house leftover/);
  const formBlock = skipHeader.slice(
    skipHeader.indexOf('{hasFormGuide && ('),
    skipHeader.indexOf('{shouldShowExerciseSwapMenuitem(')
  );
  assert.match(formBlock, /house-btn house-btn-ghost/);
  assert.match(formBlock, /data-testid="active-form-guide"/);
  assert.match(formBlock, /onFormGuide/);
  assert.doesNotMatch(formBlock, /<Button/);
  assert.doesNotMatch(formBlock, /variant="ghost"/);
  assert.doesNotMatch(formBlock, /house-btn-primary/);
  assert.doesNotMatch(formBlock, /text-primary/);
  const swapBlock = skipHeader.slice(
    skipHeader.indexOf('{shouldShowExerciseSwapMenuitem('),
    skipHeader.indexOf('<ActiveExerciseMoreMenu')
  );
  assert.match(swapBlock, /house-btn house-btn-ghost/);
  assert.match(swapBlock, /data-testid="active-swap-exercise"/);
  assert.match(swapBlock, /onToggleSwap/);
  assert.doesNotMatch(swapBlock, /<Button/);
  assert.doesNotMatch(swapBlock, /variant="ghost"/);
  assert.doesNotMatch(swapBlock, /house-btn-primary/);
  assert.doesNotMatch(swapBlock, /text-primary/);
  const skipBlock = skipHeader.slice(
    skipHeader.indexOf('shouldShowSessionSkip({'),
    skipHeader.indexOf('hasCompleted && !skipped')
  );
  assert.match(skipBlock, /HoldToConfirmButton/);
  assert.match(skipBlock, /chrome="house"/);
  assert.match(skipBlock, /data-testid="active-skip-exercise"/);
  assert.doesNotMatch(skipBlock, /variant="outline"/);
  assert.match(spec, /Skip this exercise is house-btn hold/);
  assert.match(spec, /Swap is house-btn ghost/);
  assert.match(spec, /Form guide is house-btn ghost/);
  const repeatBlock = skipHeader.slice(
    skipHeader.indexOf('{hasCompleted && !skipped && ('),
    skipHeader.indexOf('<SessionSwapSheet')
  );
  assert.match(repeatBlock, /data-testid="active-repeat-last"/);
  assert.match(repeatBlock, /house-btn min-h-\[44px\] w-fit tap-target/);
  assert.match(repeatBlock, /activeRepeatLast/);
  assert.doesNotMatch(repeatBlock, /<Button/);
  assert.doesNotMatch(repeatBlock, /variant="outline"/);
  assert.doesNotMatch(repeatBlock, /house-btn-primary/);
  assert.match(spec, /Repeat last set is house-btn, not filled/);
  const pinField = read('src/components/workout/ExercisePinnedNoteField.tsx');
  const noteField = read('src/components/workout/ExerciseNoteField.tsx');
  assert.match(pinField, /house-field min-h-\[44px\]/);
  assert.match(pinField, /data-testid="exercise-pin"/);
  assert.doesNotMatch(pinField, /border-2/);
  assert.doesNotMatch(pinField, /focus:ring-2/);
  assert.match(noteField, /house-field min-h-\[44px\]/);
  assert.match(noteField, /data-testid="exercise-note"/);
  assert.doesNotMatch(noteField, /border-2/);
  assert.doesNotMatch(noteField, /focus:ring-2/);
  assert.match(css, /\.house-compose-live \.house-field \{[^}]*--house-line/);
  assert.match(
    css,
    /\.house-compose-live \.house-field:focus,\s*\.mw-house \.house-compose-live \.house-field:focus-visible \{[^}]*box-shadow:\s*none/
  );
  assert.match(spec, /Pin and Note are house-field/);
  const exerciseMore = read('src/components/workout/ActiveExerciseMoreMenu.tsx');
  assert.match(exerciseMore, /data-testid="active-exercise-more"/);
  assert.match(exerciseMore, /house-btn house-btn-ghost/);
  assert.match(exerciseMore, /house-card house-exercise-more/);
  assert.match(exerciseMore, /house-exercise-more-foot/);
  assert.match(exerciseMore, /chrome="house"/);
  assert.match(exerciseMore, /data-testid="active-hide-from-library"/);
  assert.match(exerciseMore, /role="menu"/);
  assert.doesNotMatch(exerciseMore, /<Button/);
  assert.doesNotMatch(exerciseMore, /border-2/);
  assert.doesNotMatch(exerciseMore, /hover:bg-muted/);
  assert.doesNotMatch(exerciseMore, /house-btn-primary/);
  assert.match(spec, /Exercise more is house leftover/);
  const swapSheet = read('src/components/workout/SessionSwapSheet.tsx');
  assert.match(swapSheet, /data-testid="session-swap-confirm"/);
  assert.match(swapSheet, /mw-house house-swap-sheet/);
  assert.match(swapSheet, /house-btn min-h-\[52px\] w-full tap-target/);
  assert.match(swapSheet, /disabled=\{!canConfirm\}/);
  assert.doesNotMatch(swapSheet, /<Button/);
  assert.doesNotMatch(swapSheet, /variant="default"/);
  assert.doesNotMatch(swapSheet, /primary-action/);
  assert.doesNotMatch(swapSheet, /house-btn-primary/);
  assert.match(css, /\.house-btn:disabled[\s\S]*?--house-faint/);
  assert.match(spec, /Swap confirm is house-btn, not filled/);
  assert.match(spec, /Swap sheet is house leftover/);
  const garageSwap = read('src/components/workout/GarageSwapList.tsx');
  assert.match(garageSwap, /data-testid="garage-swap-list"/);
  assert.match(garageSwap, /mw-house/);
  assert.match(garageSwap, /house-btn house-btn-ghost house-swap-option/);
  assert.doesNotMatch(garageSwap, /border-2/);
  assert.doesNotMatch(garageSwap, /hover:bg-muted/);
  assert.doesNotMatch(garageSwap, /border-primary/);
  assert.doesNotMatch(garageSwap, /house-btn-primary/);
  assert.doesNotMatch(garageSwap, /accent-poster/);
  assert.match(css, /\.mw-house \.house-swap-option \{[^}]*flex-direction:\s*column/);
  assert.match(spec, /Garage swap is house leftover/);
  const formGuide = read('src/components/form/FormGuideSheet.tsx');
  assert.match(formGuide, /data-testid="form-guide-got-it"/);
  assert.match(formGuide, /house-btn min-h-\[52px\] w-full tap-target/);
  assert.match(formGuide, /house-btn house-btn-ghost/);
  assert.match(formGuide, /mw-house house-form-guide/);
  assert.match(formGuide, /house-card house-form-figure/);
  assert.match(formGuide, /house-card house-form-breath/);
  assert.match(formGuide, /house-form-section/);
  assert.match(formGuide, /house-form-mark/);
  assert.doesNotMatch(formGuide, /primary-action/);
  assert.doesNotMatch(formGuide, /bg-primary-fill/);
  assert.doesNotMatch(formGuide, /house-btn-primary/);
  assert.doesNotMatch(formGuide, /border-2/);
  assert.doesNotMatch(formGuide, /uppercase tracking-wide/);
  assert.doesNotMatch(formGuide, /text-primary/);
  assert.doesNotMatch(formGuide, /text-destructive/);
  assert.match(css, /\.mw-house\.house-form-guide \.house-form-figure \{[^}]*padding:\s*0/);
  assert.match(css, /\.mw-house\.house-form-guide \.house-form-section \{[^}]*text-transform:\s*none/);
  assert.match(spec, /Form guide confirm is house-btn, not filled/);
  assert.match(spec, /Form guide \+ Swap portal is house leftover/);
  assert.match(spec, /Merge-exercises dialog is house leftover/);
  assert.match(spec, /Form guide body is house leftover/);
  assert.match(spec, /Form guide sections is house leftover/);
  const inlineAdd = read('src/components/workout/ActiveInlineAddExercise.tsx');
  assert.match(inlineAdd, /house-add-exercise/);
  assert.match(inlineAdd, /house-btn min-h-\[44px\] tap-target/);
  assert.match(inlineAdd, /data-testid="active-add-selected-exercise"/);
  assert.doesNotMatch(inlineAdd, /border-2/);
  assert.doesNotMatch(inlineAdd, /hover:bg-muted/);
  assert.doesNotMatch(inlineAdd, /house-btn-primary/);
  assert.match(css, /\.house-compose-live \.house-add-exercise \{[^}]*--house-line/);
  assert.match(spec, /Add-exercise search is house leftover/);
  const addSheet = read('src/components/workout/AddExerciseSheet.tsx');
  assert.match(addSheet, /mw-house house-add-sheet/);
  assert.match(addSheet, /house-btn min-h-\[52px\] w-full tap-target/);
  assert.match(addSheet, /ExercisePicker/);
  assert.doesNotMatch(addSheet, /<Button/);
  assert.doesNotMatch(addSheet, /primary-action/);
  assert.doesNotMatch(addSheet, /house-btn-primary/);
  assert.match(spec, /Add-exercise sheet is house leftover/);
  const checkIn = read('src/components/workout/SessionCheckInSheet.tsx');
  assert.match(checkIn, /mw-house house-checkin/);
  assert.match(checkIn, /house-btn min-h-\[52px\] w-full tap-target/);
  assert.match(checkIn, /house-btn house-btn-ghost min-h-\[52px\] w-full tap-target/);
  assert.doesNotMatch(checkIn, /<Button/);
  assert.doesNotMatch(checkIn, /primary-action/);
  assert.doesNotMatch(checkIn, /house-btn-primary/);
  assert.match(spec, /Check-in confirm is house leftover/);
  assert.match(checkIn, /house-checkin-scale/);
  assert.match(checkIn, /house-checkin-tick/);
  assert.doesNotMatch(checkIn, /border-2/);
  assert.doesNotMatch(checkIn, /hover:bg-muted/);
  assert.match(css, /\.mw-house\.house-checkin \.house-checkin-tick\.is-on \{[^}]*--house-press/);
  assert.match(spec, /Check-in scale is house leftover/);
  const hardWarn = read('src/components/workout/HardSessionWarningSheet.tsx');
  assert.match(hardWarn, /mw-house house-hard-session/);
  assert.match(hardWarn, /house-btn min-h-\[52px\] w-full tap-target/);
  assert.match(hardWarn, /house-btn house-btn-ghost min-h-\[52px\] w-full tap-target/);
  assert.doesNotMatch(hardWarn, /<Button/);
  assert.doesNotMatch(hardWarn, /primary-action/);
  assert.doesNotMatch(hardWarn, /house-btn-primary/);
  assert.match(spec, /Hard-session confirm is house leftover/);
  const overlay = read('src/components/ui/AdaptiveOverlay.tsx');
  assert.match(overlay, /\/\\bmw-house\\b\/\.test\(className/);
  assert.match(overlay, /house-overlay-head/);
  assert.match(overlay, /house-overlay-kicker/);
  assert.match(overlay, /house-overlay-title/);
  assert.match(overlay, /house-btn house-btn-ghost house-overlay-close/);
  assert.match(overlay, /house-overlay-foot/);
  assert.match(overlay, /house-overlay-panel/);
  assert.match(overlay, /border-b-2 border-border bg-card p-4/);
  assert.match(overlay, /border-t-2 border-border bg-card p-4/);
  assert.match(overlay, /border-t-2 border-foreground/);
  assert.match(overlay, /md:border-2 md:pb-0/);
  assert.match(overlay, /hover:bg-muted/);
  assert.doesNotMatch(overlay, /house-btn-primary/);
  assert.match(css, /\.mw-house \.house-overlay-head \{[^}]*--house-line/);
  assert.match(css, /\.mw-house \.house-overlay-close \{[^}]*padding:\s*0/);
  assert.match(css, /\.mw-house \.house-overlay-foot \{[^}]*--house-line/);
  assert.match(css, /\.mw-house\.house-overlay-panel \{[^}]*--house-line/);
  assert.match(spec, /Overlay header is house leftover/);
  assert.match(spec, /Overlay footer is house leftover/);
  assert.match(spec, /Overlay panel is house leftover/);
  const movementHistory = read('src/components/workout/MovementHistorySheet.tsx');
  assert.match(movementHistory, /data-testid="movement-history-close"/);
  assert.match(movementHistory, /mw-house house-movement-sheet/);
  assert.match(movementHistory, /house-btn min-h-\[52px\] w-full tap-target/);
  assert.match(movementHistory, /house-movement-row/);
  assert.match(movementHistory, /house-set-kicker/);
  assert.doesNotMatch(movementHistory, /uppercase tracking-wider/);
  assert.match(css, /\.house-movement-row \.house-set-kicker \{[^}]*text-transform:\s*none/);
  assert.match(spec, /Movement history date is house leftover/);
  assert.doesNotMatch(movementHistory, /<Button/);
  assert.doesNotMatch(movementHistory, /variant="outline"/);
  assert.doesNotMatch(movementHistory, /border-2/);
  assert.doesNotMatch(movementHistory, /house-btn-primary/);
  assert.match(css, /\.house-movement-row \{[^}]*--house-line/);
  assert.match(spec, /This-movement history is house leftover/);
  assert.match(spec, /Movement history sheet is house leftover/);
  const setOptions = read('src/components/workout/ActiveSetOptionsMenu.tsx');
  assert.match(setOptions, /data-testid="active-set-options"/);
  assert.match(setOptions, /house-btn house-btn-ghost/);
  assert.match(setOptions, /house-card house-set-options/);
  assert.match(setOptions, /shouldShowApplyTargetsMenuitem/);
  assert.match(setOptions, /shouldShowRemoveSetMenuitem/);
  assert.doesNotMatch(setOptions, /<Button/);
  assert.doesNotMatch(setOptions, /border-2/);
  assert.doesNotMatch(setOptions, /hover:bg-muted/);
  assert.doesNotMatch(setOptions, /text-primary/);
  assert.doesNotMatch(setOptions, /house-btn-primary/);
  assert.match(spec, /Set options is house leftover/);
  const reorder = read('src/components/workout/ExerciseReorderHandle.tsx');
  assert.match(reorder, /data-testid="exercise-reorder-handle"/);
  assert.match(reorder, /data-testid="exercise-reorder-up"/);
  assert.match(reorder, /data-testid="exercise-reorder-down"/);
  assert.match(reorder, /house-btn house-btn-ghost house-reorder/);
  assert.doesNotMatch(reorder, /<Button/);
  assert.doesNotMatch(reorder, /variant="ghost"/);
  assert.doesNotMatch(reorder, /text-muted-foreground/);
  assert.doesNotMatch(reorder, /house-btn-primary/);
  assert.match(css, /\.house-compose-live \.house-reorder \{[^}]*padding-inline:\s*0/);
  assert.match(spec, /Reorder handle is house leftover/);
  const lastGhost = read('src/components/workout/LastSetGhostButton.tsx');
  assert.match(lastGhost, /data-testid="last-set-ghost"/);
  assert.match(lastGhost, /house-btn house-btn-ghost house-last-ghost/);
  assert.match(lastGhost, /shouldOfferLastSetGhost/);
  assert.doesNotMatch(lastGhost, /border-2/);
  assert.doesNotMatch(lastGhost, /hover:bg-muted/);
  assert.doesNotMatch(lastGhost, /house-btn-primary/);
  assert.doesNotMatch(lastGhost, /primary-action/);
  assert.doesNotMatch(lastGhost, /accent-poster/);
  assert.match(css, /\.house-compose-live \.house-last-ghost \{[^}]*flex-start/);
  assert.match(spec, /Last-set ghost is house leftover/);
  const loadPct = read('src/components/workout/SetLoadPctField.tsx');
  assert.match(loadPct, /data-testid=\{testId\}/);
  assert.match(loadPct, /house-num h-11 min-h-\[44px\] w-\[4\.75rem\] tap-target/);
  assert.match(loadPct, /parseOptionalLoadPct/);
  assert.doesNotMatch(loadPct, /border-2/);
  assert.doesNotMatch(loadPct, /focus:ring-2/);
  assert.doesNotMatch(loadPct, /house-btn-primary/);
  assert.doesNotMatch(loadPct, /accent-poster/);
  assert.match(
    css,
    /\.house-history \.house-num,\s*\.mw-house \.house-compose-live \.house-num \{[^}]*--house-line/
  );
  assert.match(spec, /Load-% cell is house-num/);
  const readiness = read('src/components/workout/ActiveReadinessDeltaStrip.tsx');
  assert.match(readiness, /data-testid="active-readiness-delta"/);
  assert.match(readiness, /house-readiness/);
  assert.match(readiness, /house-btn house-btn-ghost min-h-\[44px\] tap-target/);
  assert.match(readiness, /shouldShowReadinessDelta/);
  assert.doesNotMatch(readiness, /border-2/);
  assert.doesNotMatch(readiness, /hover:border-primary/);
  assert.doesNotMatch(readiness, /house-btn-primary/);
  assert.doesNotMatch(readiness, /accent-poster/);
  assert.match(css, /\.house-compose-live \.house-readiness \{[^}]*padding/);
  assert.match(spec, /Readiness extra is house leftover/);
  const warmupToggle = setTable.slice(
    setTable.indexOf('data-testid="set-table-warmup-toggle"'),
    setTable.indexOf('data-testid="set-table-warmup-toggle"') + 520
  );
  assert.match(warmupToggle, /house-btn house-btn-ghost house-warmup-toggle/);
  assert.match(warmupToggle, /min-h-\[44px\]/);
  assert.match(warmupToggle, /tap-target/);
  assert.doesNotMatch(warmupToggle, /hover:bg-muted/);
  assert.doesNotMatch(warmupToggle, /border-2/);
  assert.doesNotMatch(warmupToggle, /house-btn-primary/);
  assert.doesNotMatch(warmupToggle, /accent-poster/);
  assert.match(css, /\.house-compose-live \.house-warmup-toggle \{[^}]*padding-inline:\s*0/);
  assert.match(spec, /Warmup toggle is house leftover/);
  const setSide = read('src/components/workout/SetSideSelect.tsx');
  assert.match(setSide, /house-num h-11 min-h-\[44px\] min-w-\[44px\] tap-target/);
  assert.match(setSide, /parseSetSide/);
  assert.doesNotMatch(setSide, /border-2/);
  assert.doesNotMatch(setSide, /focus:ring-2/);
  assert.doesNotMatch(setSide, /house-btn-primary/);
  assert.doesNotMatch(stripComments(setSide), /accent-poster/);
  assert.match(
    css,
    /\.house-history select\.house-num,\s*\.mw-house \.house-compose-live select\.house-num \{[^}]*padding-inline:\s*6px/
  );
  assert.match(spec, /Set side is house-num/);
  assert.match(spec, /--house-radius-sheet/);
  assert.match(spec, /--house-selected/);
});

test('on the sheet, Today starts with the session — one Start, no nested hero card', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /data-house-desk=['"]today['"]/);
  assert.match(css, /\.house-sheet \.house-card-hero \{[\s\S]*background:\s*transparent/);
  assert.doesNotMatch(css, /\.house-sheet \.house-first-rooms \{[\s\S]*background:\s*transparent/);
  const desk = stripComments(read('src/page-components/TodayDesk.tsx'));
  assert.match(desk, /<h1 className="house-title">/);
  const primaries = [...desk.matchAll(/house-btn-primary/g)];
  assert.equal(primaries.length, 1, 'Start stays the only filled action');
  assert.match(desk, /router\.push\('\/active'\)/);
  const second = stripComments(read('src/components/house/HouseSecondRail.tsx'));
  assert.match(second, /row\.id === 'start'\) return false/);
});

