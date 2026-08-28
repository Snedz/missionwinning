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
  const trainSide = stripComments(read('src/components/house/TrainSidecar.tsx'));
  assert.match(trainSide, /house-sidecar/);
  assert.match(trainSide, /startRest/);
  assert.doesNotMatch(trainSide, /href: '\/history'/);
  assert.doesNotMatch(trainSide, /href: '\/coach'/);
  assert.doesNotMatch(trainSide, /href: '\/server'/);
  assert.match(spec, /History stays on Home/);
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
  assert.match(setTable, /data-testid="set-table-log-set"/);
  assert.match(setTable, /bg-\[hsl\(var\(--accent-poster\)\)\]/);
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

