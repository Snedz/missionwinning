/**
 * Chat never sits on Today or Train first paint.
 *
 * Discover the Today tree and the logger files rather than listing widgets:
 * a new Today card that imported the messenger would otherwise be invisible
 * to a hand-maintained allowlist.
 *
 * `.1053` closed the holes this file had at `.752`: AppLayout chrome wraps
 * every Today/Train paint, and Coach chat must not share a store with Garage.
 * Product rooms: docs/IA_SKELETON.md.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { LOGGER_FILES, reaches } from '@/lib/domainBoundary';
import { MOBILE_TAB_HREFS, resolveMobileTabHrefs } from '@/lib/primaryNav';
import { RAIL_GROUPS } from '@/lib/navConfig';
import { STORAGE_KEYS } from '@/lib/storage/keys';

const root = path.join(import.meta.dirname, '..', '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(path.join(root, dir));
  } catch {
    return out;
  }
  for (const name of entries) {
    const rel = `${dir}/${name}`;
    const st = statSync(path.join(root, rel));
    if (st.isDirectory()) walk(rel, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.(test|routetest)\.(ts|tsx)$/.test(name)) out.push(rel);
  }
  return out;
}

const read = (file: string): string | null => {
  try {
    return readFileSync(path.join(root, file), 'utf8');
  } catch {
    return null;
  }
};

const CHAT_ROOTS = ['src/lib/social/', 'src/components/social/'] as const;

/**
 * Outbox drain is an emit, not a messenger window. AppLayout boots
 * `useOutboxDrain` → `registerSocialSyncHandler` the same way it drains
 * workouts. Walking through that door would call the Garage store a
 * Today first-paint widget. The door is terminal — chrome may enqueue;
 * it may not mount ChatWindow.
 */
const FIRST_PAINT_DOORS = ['src/lib/socialSync.ts'] as const;

/** Page trees that own LOG first paint. HomePage walks HomeTodayLean. */
const TODAY_TRAIN_ENTRIES = [
  'src/page-components/HomePage.tsx',
  'src/page-components/ActiveWorkoutPage.tsx',
  ...LOGGER_FILES,
  ...walk('src/components/today'),
];

/**
 * Chrome that wraps every signed-in paint, including Today and Train.
 * A ChatWindow here is a type-5 bubble on the log path.
 */
const FIRST_PAINT_CHROME = [
  'src/components/layout/AppLayout.tsx',
  'src/components/layout/MobileNav.tsx',
  'src/components/layout/AppHeader.tsx',
] as const;

/**
 * Coach chat lives on /coach. C1 already walks src/lib/coach/. The hole
 * was the page + panel + HTTP door, which sit outside PLANNER_ROOTS.
 */
const COACH_CHAT_ENTRIES = [
  'src/page-components/CoachPage.tsx',
  'src/lib/coachChatServer.ts',
  ...walk('src/components/coach'),
];

function isolationHits(
  entries: readonly string[],
  opts?: { allow?: readonly string[] }
): { seen: Set<string>; offenders: string[] } {
  const seen = new Set<string>();
  const offenders: string[] = [];
  for (const file of entries) {
    if (seen.has(file)) continue;
    seen.add(file);
    assert.ok(read(file) !== null, `${file} is in the isolation scan but missing`);
    const chain = reaches(file, CHAT_ROOTS, read, opts);
    if (chain) offenders.push(chain.join(' → '));
  }
  return { seen, offenders };
}

test('chat is not imported from Today or Train first-paint trees', () => {
  const { seen, offenders } = isolationHits(TODAY_TRAIN_ENTRIES);
  assert.ok(seen.size >= 8, `isolation scan only reached ${seen.size} files — discovery drifted`);
  assert.deepEqual(
    offenders,
    [],
    `Speech never owns first paint; chat is not a Today tab or a set-log row.\n${offenders.join('\n')}`
  );
});

test('chat is never a reason to withhold a set', () => {
  const { offenders } = isolationHits(LOGGER_FILES);
  assert.deepEqual(offenders, [], `logSet path reached messenger:\n${offenders.join('\n')}`);

  const withhold =
    /missionServer|ChatWindow|BuddyList|unreadCount|PresenceControl|from ['"]@\/lib\/social|from ['"]@\/components\/social/;
  for (const file of [
    'src/store/workoutStore.ts',
    'src/components/workout/SetLogRow.tsx',
    'src/lib/firstSetUngated.ts',
  ] as const) {
    const src = read(file);
    assert.ok(src !== null, `${file} moved`);
    assert.doesNotMatch(src, withhold, `${file} must not gate a set on chat`);
  }
  const logSet = read('src/store/workoutStore.ts');
  assert.ok(logSet !== null);
  assert.match(logSet, /logSet:\s*\(/, 'logSet must still exist so this test is not vacuous');
});

test('first-paint chrome does not import messenger', () => {
  const { seen, offenders } = isolationHits(FIRST_PAINT_CHROME, { allow: FIRST_PAINT_DOORS });
  assert.equal(seen.size, FIRST_PAINT_CHROME.length, 'first-paint chrome list drifted');
  assert.deepEqual(
    offenders,
    [],
    `AppLayout wraps Today and Train. A messenger import here is a bubble on the log path.\n${offenders.join('\n')}`
  );
  const ui = /ChatWindow|BuddyList|MessageComposer|PresenceControl|CoachChatPanel|from ['"]@\/components\/social/;
  for (const file of FIRST_PAINT_CHROME) {
    const src = read(file);
    assert.ok(src !== null, `${file} missing`);
    assert.doesNotMatch(src, ui, `${file} mounts messenger UI on first paint`);
  }
});

test('outbox drain is a door, not a Today chat widget', () => {
  const chain = reaches('src/components/layout/AppLayout.tsx', CHAT_ROOTS, read, {
    allow: FIRST_PAINT_DOORS,
  });
  assert.equal(chain, null, 'socialSync must stay terminal or the outbox looks like a chat bubble');
  const withoutDoor = reaches('src/components/layout/AppLayout.tsx', CHAT_ROOTS, read);
  assert.ok(
    withoutDoor?.some((p) => p.includes('socialSync') || p.includes('social/')),
    'sanity: without the door the walk still reaches social — the door is doing work'
  );
});

test('Coach chat does not read Garage', () => {
  const { seen, offenders } = isolationHits(COACH_CHAT_ENTRIES);
  assert.ok(
    seen.size >= 6,
    `Coach isolation scan only reached ${seen.size} files — CoachPage / coach/ widgets drifted`
  );
  assert.deepEqual(
    offenders,
    [],
    `Coach chat stays on /coach. It does not share a thread with Garage.\n${offenders.join('\n')}`
  );
});

test('isolation scan includes HomePage, ActiveWorkoutPage, today/, and first-paint chrome', () => {
  assert.ok(TODAY_TRAIN_ENTRIES.includes('src/page-components/HomePage.tsx'));
  assert.ok(TODAY_TRAIN_ENTRIES.includes('src/page-components/ActiveWorkoutPage.tsx'));
  assert.ok(
    TODAY_TRAIN_ENTRIES.some((f) => f.startsWith('src/components/today/')),
    'today/ widgets must be discovered, not listed'
  );
  assert.ok(FIRST_PAINT_CHROME.includes('src/components/layout/AppLayout.tsx'));
  assert.ok(COACH_CHAT_ENTRIES.includes('src/page-components/CoachPage.tsx'));
  assert.ok(
    COACH_CHAT_ENTRIES.some((f) => f.startsWith('src/components/coach/')),
    'coach/ widgets must be discovered, not listed'
  );
});

test('a fake Today import of social is a hit — the walk is not vacuous', () => {
  const fake = (files: Record<string, string>) => (p: string) => files[p] ?? null;
  const chain = reaches(
    'src/page-components/HomePage.tsx',
    CHAT_ROOTS,
    fake({
      'src/page-components/HomePage.tsx': "import { loadMissionServer } from '@/lib/social/store';",
      'src/lib/social/store.ts': '',
    })
  );
  assert.deepEqual(chain, ['src/page-components/HomePage.tsx', 'src/lib/social/store.ts']);
});

test('log-path tabs stay /log + /active only', () => {
  assert.deepEqual([...MOBILE_TAB_HREFS], ['/log', '/active']);
  assert.deepEqual([...resolveMobileTabHrefs({ hasActiveWorkout: false })], ['/log']);
  assert.deepEqual([...resolveMobileTabHrefs({ hasActiveWorkout: true })], ['/log', '/active']);
  for (const live of [false, true]) {
    const hrefs = resolveMobileTabHrefs({ hasActiveWorkout: live });
    assert.ok(!hrefs.includes('/server'), 'Messenger is never a dock tab');
    assert.ok(!hrefs.includes('/coach'), 'Coach is Search, not a dock tab');
    assert.ok(!hrefs.includes('/coaching'), 'Human coaching is not a dock tab');
  }
});

test('/server is More → You, never rail or tab', () => {
  const railHrefs = RAIL_GROUPS.flatMap((g) => g.hrefs);
  assert.ok(!railHrefs.includes('/server'), '/server must not be a rail href');
  const tabHrefs: readonly string[] = MOBILE_TAB_HREFS;
  assert.ok(!tabHrefs.includes('/server'));
});

test('Coach and Garage do not share a store or badge key', () => {
  assert.notEqual(STORAGE_KEYS.missionServer, STORAGE_KEYS.coachPlan);
  assert.equal(STORAGE_KEYS.missionServer, 'mw_mission_server');
  assert.equal(STORAGE_KEYS.coachPlan, 'mw_coach_plan');

  const coachHits: string[] = [];
  for (const file of COACH_CHAT_ENTRIES) {
    const src = read(file);
    if (src === null) continue;
    if (src.includes('mw_mission_server') || src.includes('STORAGE_KEYS.missionServer')) {
      coachHits.push(file);
    }
  }
  assert.deepEqual(coachHits, [], `Coach files must not name the Garage store:\n${coachHits.join('\n')}`);

  const socialStore = read('src/lib/social/store.ts');
  assert.ok(socialStore !== null, 'src/lib/social/store.ts moved');
  assert.doesNotMatch(socialStore, /mw_coach_plan|STORAGE_KEYS\.coachPlan/);
  assert.doesNotMatch(socialStore, /from ['"]@\/lib\/coach/);
  assert.doesNotMatch(socialStore, /from ['"]@\/components\/coach/);
});
