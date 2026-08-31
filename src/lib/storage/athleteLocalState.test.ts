import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { STORAGE_KEYS, WORKOUT_STORE_KEY } from '@/lib/storage/keys';
import {
  __resetForTests,
  readRaw,
  writeRaw,
} from '@/lib/storage/safeStorage';
import {
  ATHLETE_LOCAL_KEEP,
  EXPLICIT_SIGN_OUT_FRESH_MS,
  applySignedOutStorage,
  applySignInStoragePlan,
  bindStorageOwner,
  clearAthleteLocalState,
  hasFreshExplicitSignOut,
  markExplicitSignOut,
  planSignInStorage,
  planSignedOutStorage,
  readStorageOwner,
  shouldAdoptGuestHistory,
  stripRestrictedHealthLocal,
} from '@/lib/storage/athleteLocalState';

const root = join(import.meta.dirname, '../../..');

type Mem = {
  map: Map<string, string>;
  install: () => void;
  uninstall: () => void;
};

function stubStorage(): Mem {
  const map = new Map<string, string>();
  const storage = {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
  } as Storage;
  const prev = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  return {
    map,
    install() {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: storage,
      });
    },
    uninstall() {
      if (prev) Object.defineProperty(globalThis, 'localStorage', prev);
      else delete (globalThis as { localStorage?: Storage }).localStorage;
    },
  };
}

let mem: Mem;

beforeEach(() => {
  __resetForTests();
  mem = stubStorage();
  mem.install();
});

afterEach(() => {
  mem.uninstall();
  __resetForTests();
});

test('plan: same owner merges; foreign owner replaces; unbound guest always adopts', () => {
  assert.equal(planSignInStorage('u1', 'u1', true), 'merge');
  assert.equal(planSignInStorage('u1', 'u2', true), 'replace-from-cloud');
  assert.equal(planSignInStorage(null, 'u2', true), 'adopt-guest-sans-health');
  assert.equal(planSignInStorage(null, 'u2', false), 'adopt-guest-sans-health');
  assert.equal(planSignInStorage('', 'u2', false), 'adopt-guest-sans-health');
  assert.equal(planSignInStorage(undefined, 'u2', true), 'adopt-guest-sans-health');
});

test('shouldAdoptGuestHistory is adopt + merge only', () => {
  assert.equal(shouldAdoptGuestHistory('adopt-guest-sans-health'), true);
  assert.equal(shouldAdoptGuestHistory('merge'), true);
  assert.equal(shouldAdoptGuestHistory('replace-from-cloud'), false);
});

test('adopt keeps guest workout store and still strips restricted health', () => {
  const planted = JSON.stringify({ state: { workoutHistory: [{ id: 'guest-1' }] } });
  writeRaw(WORKOUT_STORE_KEY, planted);
  writeRaw(STORAGE_KEYS.lastAssessment, '{"risk":"high"}');
  writeRaw(STORAGE_KEYS.pregnancyFlag, '1');
  writeRaw(
    STORAGE_KEYS.journeyState,
    JSON.stringify({ readiness: { parq: true }, iDay: { completedAt: 't' } })
  );

  applySignInStoragePlan('adopt-guest-sans-health');

  assert.equal(readRaw(WORKOUT_STORE_KEY), planted);
  assert.equal(readRaw(STORAGE_KEYS.lastAssessment), null);
  assert.equal(readRaw(STORAGE_KEYS.pregnancyFlag), null);
  const journey = JSON.parse(readRaw(STORAGE_KEYS.journeyState) ?? '{}') as {
    iDay?: { completedAt?: string };
    readiness?: { parq?: boolean };
  };
  assert.equal(journey.iDay?.completedAt, 't');
  assert.equal(journey.readiness?.parq, false);
});

test('foreign replace still wipes the workout store', () => {
  writeRaw(WORKOUT_STORE_KEY, JSON.stringify({ state: { workoutHistory: [{ id: 'left-1' }] } }));
  applySignInStoragePlan('replace-from-cloud');
  assert.equal(readRaw(WORKOUT_STORE_KEY), null);
});

test('merge does not wipe the workout store', () => {
  const planted = JSON.stringify({ state: { workoutHistory: [{ id: 'same-1' }] } });
  writeRaw(WORKOUT_STORE_KEY, planted);
  applySignInStoragePlan('merge');
  assert.equal(readRaw(WORKOUT_STORE_KEY), planted);
});

test('mutant: clear workout store on any SIGNED_IN plan dies', () => {
  const planted = JSON.stringify({ state: { workoutHistory: [{ id: 'guest-keep' }] } });
  for (const plan of ['adopt-guest-sans-health', 'merge'] as const) {
    writeRaw(WORKOUT_STORE_KEY, planted);
    applySignInStoragePlan(plan);
    assert.equal(
      readRaw(WORKOUT_STORE_KEY),
      planted,
      `${plan} must not restore the wipe-on-any-SIGNED_IN defect`
    );
  }
});

test('clearAthleteLocalState drops PAR-Q, journey, logs, and the workout store', () => {
  writeRaw(STORAGE_KEYS.lastAssessment, JSON.stringify({ risk: 'high', date: '2026-08-14' }));
  writeRaw(STORAGE_KEYS.journeyState, JSON.stringify({ readiness: { parq: true } }));
  writeRaw(STORAGE_KEYS.pregnancyFlag, '1');
  writeRaw(STORAGE_KEYS.deviceId, 'dev-1');
  writeRaw(WORKOUT_STORE_KEY, JSON.stringify({ state: { history: [1] } }));
  writeRaw(STORAGE_KEYS.privacyConsent, 'accepted');
  writeRaw(STORAGE_KEYS.analyticsPref, 'deny');
  writeRaw(STORAGE_KEYS.localeChoice, 'en');

  clearAthleteLocalState();

  assert.equal(readRaw(STORAGE_KEYS.lastAssessment), null);
  assert.equal(readRaw(STORAGE_KEYS.journeyState), null);
  assert.equal(readRaw(STORAGE_KEYS.pregnancyFlag), null);
  assert.equal(readRaw(STORAGE_KEYS.deviceId), null);
  assert.equal(readRaw(WORKOUT_STORE_KEY), null);
  assert.equal(readRaw(STORAGE_KEYS.privacyConsent), 'accepted');
  assert.equal(readRaw(STORAGE_KEYS.analyticsPref), 'deny');
  assert.equal(readRaw(STORAGE_KEYS.localeChoice), 'en');
});

test('stripRestrictedHealthLocal clears PAR-Q without wiping I-Day', () => {
  writeRaw(
    STORAGE_KEYS.journeyState,
    JSON.stringify({
      phase: 'basic',
      iDay: { completedAt: 't' },
      readiness: { parq: true, streakMet: false, winScoreSeen: false },
    })
  );
  writeRaw(STORAGE_KEYS.lastAssessment, '{"risk":"moderate"}');
  writeRaw(STORAGE_KEYS.experience, 'beginner');

  stripRestrictedHealthLocal();

  assert.equal(readRaw(STORAGE_KEYS.lastAssessment), null);
  const journey = JSON.parse(readRaw(STORAGE_KEYS.journeyState) ?? '{}') as {
    iDay?: { completedAt?: string };
    readiness?: { parq?: boolean };
  };
  assert.equal(journey.iDay?.completedAt, 't');
  assert.equal(journey.readiness?.parq, false);
  assert.equal(readRaw(STORAGE_KEYS.experience), 'beginner');
});

test('bindStorageOwner is what later sign-ins compare', () => {
  assert.equal(readStorageOwner(), null);
  bindStorageOwner('user-abc');
  assert.equal(readStorageOwner(), 'user-abc');
  clearAthleteLocalState();
  assert.equal(readStorageOwner(), null, 'owner is athlete-scoped and must wipe');
});

test('keep-list is closed — a new consent key must be added here on purpose', () => {
  const keep = new Set<string>(ATHLETE_LOCAL_KEEP);
  assert.ok(keep.has(STORAGE_KEYS.privacyConsent));
  assert.ok(keep.has(STORAGE_KEYS.analyticsPref));
  assert.ok(keep.has(STORAGE_KEYS.explicitSignOut));
  assert.ok(!keep.has(STORAGE_KEYS.lastAssessment));
  assert.ok(!keep.has(STORAGE_KEYS.journeyState));
  assert.ok(!keep.has(STORAGE_KEYS.pregnancyFlag));
});

test('AccountPage marks explicit leave before the wipe', () => {
  const src = readFileSync(join(root, 'src/page-components/AccountPage.tsx'), 'utf8');
  const fn = src.slice(src.indexOf('const handleSignOut'), src.indexOf('const ownerTools'));
  assert.match(fn, /markExplicitSignOut\s*\(/);
  assert.match(fn, /clearAthleteLocalState\s*\(/);
  assert.ok(
    fn.indexOf('markExplicitSignOut') < fn.indexOf('clearAthleteLocalState'),
    'intent must be written before the wipe so other tabs can see it'
  );
  assert.match(fn, /signOut\s*\(/);
});

test('SIGNED_OUT without an explicit leave keeps the guest log', () => {
  writeRaw(WORKOUT_STORE_KEY, JSON.stringify({ state: { history: [{ id: 'guest-1' }] } }));
  writeRaw(STORAGE_KEYS.deviceId, 'dev-guest');
  writeRaw(STORAGE_KEYS.journeyState, JSON.stringify({ phase: 'basic' }));

  assert.equal(planSignedOutStorage({ explicitSignOut: false }), 'keep-local');
  const plan = applySignedOutStorage({ explicitSignOut: false });
  assert.equal(plan, 'keep-local');
  assert.equal(
    readRaw(WORKOUT_STORE_KEY),
    JSON.stringify({ state: { history: [{ id: 'guest-1' }] } })
  );
  assert.equal(readRaw(STORAGE_KEYS.deviceId), 'dev-guest');
  assert.equal(readRaw(STORAGE_KEYS.journeyState), JSON.stringify({ phase: 'basic' }));
});

test('explicit sign-out still wipes athlete keys (shared-device privacy)', () => {
  writeRaw(WORKOUT_STORE_KEY, JSON.stringify({ state: { history: [{ id: 'acct-1' }] } }));
  writeRaw(STORAGE_KEYS.deviceId, 'dev-acct');
  writeRaw(STORAGE_KEYS.privacyConsent, 'accepted');

  assert.equal(planSignedOutStorage({ explicitSignOut: true }), 'wipe-athlete');
  applySignedOutStorage({ explicitSignOut: true });
  assert.equal(readRaw(WORKOUT_STORE_KEY), null);
  assert.equal(readRaw(STORAGE_KEYS.deviceId), null);
  assert.equal(readRaw(STORAGE_KEYS.privacyConsent), 'accepted');
});

test('explicit sign-out mark is fresh only for a short window', () => {
  const now = 1_700_000_000_000;
  markExplicitSignOut(now);
  assert.equal(hasFreshExplicitSignOut(now), true);
  assert.equal(hasFreshExplicitSignOut(now + EXPLICIT_SIGN_OUT_FRESH_MS - 1), true);
  assert.equal(hasFreshExplicitSignOut(now + EXPLICIT_SIGN_OUT_FRESH_MS), false);
  assert.equal(hasFreshExplicitSignOut(now - 1), false);
});

test('keep-list holds the sign-out mark so other tabs can see it', () => {
  const keep = new Set<string>(ATHLETE_LOCAL_KEEP);
  assert.ok(keep.has(STORAGE_KEYS.explicitSignOut));
});

test('useJourneySync wipes on SIGNED_OUT only through the predicate', () => {
  const src = readFileSync(join(root, 'src/hooks/useJourneySync.ts'), 'utf8');
  const signedOut = src.slice(src.indexOf("event === 'SIGNED_OUT'"));
  assert.match(signedOut, /applySignedOutStorage/);
  assert.match(signedOut, /hasFreshExplicitSignOut/);
  assert.doesNotMatch(
    signedOut.slice(0, signedOut.indexOf('});')),
    /clearAthleteLocalState\s*\(/,
    'unconditional wipe on SIGNED_OUT is the guest silent-wipe defect'
  );
});

test('SIGNED_IN re-queues guest history after the planner — no Force Sync tap', () => {
  const src = readFileSync(join(root, 'src/hooks/useJourneySync.ts'), 'utf8');
  const signedIn = src.slice(src.indexOf("event === 'SIGNED_IN'"), src.indexOf("event === 'TOKEN_REFRESHED'"));
  assert.match(signedIn, /syncJourneyOnSignIn/);
  assert.match(signedIn, /shouldAdoptGuestHistory/);
  assert.match(signedIn, /syncCurrentHistoryToCloud/);
  assert.ok(
    signedIn.indexOf('syncJourneyOnSignIn') < signedIn.indexOf('syncCurrentHistoryToCloud'),
    'planner must run before re-queue so foreign replace does not enqueue leftovers'
  );
  assert.doesNotMatch(
    signedIn,
    /clearAthleteLocalState\s*\(/,
    'SIGNED_IN must not restore wipe-on-any-sign-in'
  );
});

test('Train/Coach history readers stay store-keyed — no owner gate', () => {
  const files = [
    'src/lib/workout/setRowAdjacency.ts',
    'src/lib/workout/activeWorkoutHelpers.ts',
    'src/lib/coach/contextBuilder.ts',
    'src/lib/coach/weekRationale.ts',
  ];
  for (const rel of files) {
    const src = readFileSync(join(root, rel), 'utf8');
    assert.doesNotMatch(src, /readStorageOwner|STORAGE_KEYS\.storageOwner/, rel);
    assert.doesNotMatch(src, /shouldAdoptGuestHistory/, rel);
  }
});
