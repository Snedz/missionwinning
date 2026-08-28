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
  assert.match(guide, /today-start-ready/);
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
  assert.match(css, /\.house-catalog \.house-item-pick/);
  assert.match(css, /\.house-floor \.house-rail-plus \{[\s\S]*width:\s*40px/);
  assert.match(css, /\.house-history \.house-item/);
  assert.match(css, /\.house-dock \.primary-action/);
  const history = read('src/page-components/HistoryPage.tsx');
  assert.match(history, /className="house-history"/);
  assert.match(history, /className="house-list"/);
  assert.match(history, /house-item-body/);
  const coach = read('src/page-components/CoachPage.tsx');
  assert.match(coach, /className="house-plan max-w-2xl pb-24"/);
  assert.match(coach, /className="house-empty"/);
  assert.match(coach, /data-testid="coach-generate-dock"/);
  assert.match(coach, /generate\(\)/);
  const builder = read('src/page-components/BuilderPage.tsx');
  assert.match(builder, /className="house-builder"/);
  assert.match(builder, /house-btn-primary primary-action/);
  assert.match(builder, /startBlank/);
  assert.match(builder, /house-empty/);
  assert.match(css, /\.house-builder \.house-item/);
  const account = read('src/page-components/AccountPage.tsx');
  assert.match(account, /className="house-account"/);
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
  assert.match(spec, /12px rows, selected `#eee`/);
  assert.match(spec, /stacked 13px muted rows/);
  const sidecar = stripComments(read('src/components/house/AccountSidecar.tsx'));
  assert.match(sidecar, /href: '\/account'/);
  assert.match(sidecar, /href: '\/profile'/);
  assert.doesNotMatch(sidecar, /href: '\/history'/);
  assert.doesNotMatch(sidecar, /href: '\/coach'/);
  assert.doesNotMatch(sidecar, /href: '\/server'/);
  const profile = read('src/page-components/ProfilePage.tsx');
  assert.match(profile, /className="house-profile"/);
  assert.match(profile, /house-btn house-btn-ghost/);
  const fuel = read('src/page-components/NutritionPage.tsx');
  assert.match(fuel, /className="house-fuel max-w-3xl pb-8"/);
  assert.match(fuel, /id="fuel-log"/);
  assert.match(fuel, /className="house-card group"/);
  assert.match(read('src/page-components/MovePage.tsx'), /className="house-move"/);
  assert.match(read('src/page-components/MindPage.tsx'), /className="house-mind"/);
  assert.match(read('src/page-components/TrackPage.tsx'), /className="house-track"/);
  assert.match(read('src/page-components/LearnPage.tsx'), /className="house-learn"/);
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

