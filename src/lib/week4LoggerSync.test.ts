import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  enqueueWeekLogged,
  isWeekLoggedPayload,
  weekLoggedDeliveryDone,
} from '@/lib/week4LoggerSync';
import { __resetForTests as resetOutbox, getState, registerHandler } from '@/lib/sync/outbox';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';
import { recordWorkingSetLogged } from '@/lib/week4Logger';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function installStorage(): () => void {
  const map = new Map<string, string>();
  const g = globalThis as { localStorage?: Storage };
  const prev = g.localStorage;
  g.localStorage = {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as unknown as Storage;
  return () => {
    if (prev === undefined) delete g.localStorage;
    else g.localStorage = prev;
  };
}

let uninstall: () => void;

beforeEach(() => {
  uninstall = installStorage();
  resetStorage();
  resetOutbox();
});

afterEach(() => {
  uninstall();
});

describe('weekLoggedDeliveryDone', () => {
  it('retries 5xx and 429; finishes 401 so a guest write cannot spin', () => {
    assert.equal(weekLoggedDeliveryDone(200), true);
    assert.equal(weekLoggedDeliveryDone(401), true);
    assert.equal(weekLoggedDeliveryDone(429), false);
    assert.equal(weekLoggedDeliveryDone(500), false);
  });
});

describe('isWeekLoggedPayload', () => {
  it('accepts YYYY-Www only', () => {
    assert.equal(isWeekLoggedPayload({ isoWeek: '2026-W33' }), true);
    assert.equal(isWeekLoggedPayload({ isoWeek: '2026-08-13' }), false);
    assert.equal(isWeekLoggedPayload({}), false);
  });
});

describe('guest has no server write', () => {
  it('recordWorkingSetLogged as guest does not enqueue week.logged', () => {
    registerHandler('week.logged', async () => true);
    recordWorkingSetLogged(
      { kind: 'normal', exerciseId: 'squat', weight: 100 },
      {
        source: 'guest',
        now: new Date(2026, 7, 13, 12),
        track: () => undefined,
        // Real enqueue — the guest branch must not call it.
        enqueueWeekLogged,
      }
    );
    assert.equal(getState().pending, 0, 'guest must not queue a cloud write');
  });

  it('account enqueue is the only writer', () => {
    registerHandler('week.logged', async () => true);
    enqueueWeekLogged('2026-W33');
    assert.equal(getState().pending, 1);
  });
});

describe('week4LoggerSync wiring', () => {
  it('handler is registered at boot and guest recorder never fetches', () => {
    const drain = read('src/hooks/useOutboxDrain.ts');
    assert.match(drain, /registerWeekLoggedSyncHandler\(\)/);
    const recorder = read('src/lib/week4Logger.ts');
    assert.doesNotMatch(recorder, /\bfetch\s*\(/);
    const sync = read('src/lib/week4LoggerSync.ts');
    assert.match(sync, /registerHandler\('week\.logged'/);
    assert.match(sync, /enqueue\('week\.logged'/);
  });
});
