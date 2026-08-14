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
  bindStorageOwner,
  clearAthleteLocalState,
  planSignInStorage,
  readStorageOwner,
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

test('plan: same owner merges; foreign owner replaces; guest follows cloud', () => {
  assert.equal(planSignInStorage('u1', 'u1', true), 'merge');
  assert.equal(planSignInStorage('u1', 'u2', true), 'replace-from-cloud');
  assert.equal(planSignInStorage(null, 'u2', true), 'replace-from-cloud');
  assert.equal(planSignInStorage(null, 'u2', false), 'adopt-guest-sans-health');
  assert.equal(planSignInStorage('', 'u2', false), 'adopt-guest-sans-health');
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
  assert.ok(!keep.has(STORAGE_KEYS.lastAssessment));
  assert.ok(!keep.has(STORAGE_KEYS.journeyState));
  assert.ok(!keep.has(STORAGE_KEYS.pregnancyFlag));
});

test('AccountPage actually calls clearAthleteLocalState on sign-out', () => {
  const src = readFileSync(join(root, 'src/page-components/AccountPage.tsx'), 'utf8');
  assert.match(src, /clearAthleteLocalState\s*\(/);
  assert.match(src, /handleSignOut/);
});
