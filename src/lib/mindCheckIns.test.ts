import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkInReadinessDelta,
  getTodayCheckIn,
  loadCheckIns,
  MIND_CHECKINS_KEY,
  saveCheckIn,
  todayCheckInDate,
  upsertTodayPartial,
} from './mindCheckIns.ts';

describe('mindCheckIns', () => {
  const store = new Map<string, string>();
  let hadWindow: boolean;

  beforeEach(() => {
    store.clear();
    hadWindow = typeof globalThis.window !== 'undefined';
    if (!hadWindow) {
      (globalThis as unknown as { window: typeof globalThis }).window = globalThis;
    }
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        },
        removeItem: (k: string) => {
          store.delete(k);
        },
      },
    });
  });

  afterEach(() => {
    if (!hadWindow) {
      delete (globalThis as { window?: unknown }).window;
    }
  });

  it('saves and loads today check-in', () => {
    const date = todayCheckInDate();
    saveCheckIn({ date, sleep: 4, mood: 3, stress: 2, energy: 5, soreness: 2 });
    const t = getTodayCheckIn();
    assert.equal(t?.sleep, 4);
    assert.equal(t?.soreness, 2);
    assert.equal(loadCheckIns().length, 1);
    assert.ok(store.get(MIND_CHECKINS_KEY));
  });

  it('upsertTodayPartial merges without wiping mood', () => {
    const date = todayCheckInDate();
    saveCheckIn({ date, sleep: 3, mood: 5, stress: 1, energy: 3 });
    upsertTodayPartial({ sleep: 2, soreness: 4, energy: 2 });
    const t = getTodayCheckIn();
    assert.equal(t?.mood, 5);
    assert.equal(t?.sleep, 2);
    assert.equal(t?.soreness, 4);
    assert.equal(t?.energy, 2);
  });
});

describe('checkInReadinessDelta', () => {
  it('returns 0 for null', () => {
    assert.equal(checkInReadinessDelta(null), 0);
  });

  it('penalizes poor sleep and high soreness', () => {
    const d = checkInReadinessDelta({ sleep: 1, stress: 3, energy: 3, soreness: 5 });
    assert.ok(d < 0);
    assert.ok(d >= -15);
  });

  it('rewards good sleep and energy', () => {
    const d = checkInReadinessDelta({ sleep: 5, stress: 2, energy: 5, soreness: 1 });
    assert.ok(d > 0);
    assert.ok(d <= 15);
  });

  it('clamps extreme combinations to ±15', () => {
    const bad = checkInReadinessDelta({ sleep: 1, stress: 5, energy: 1, soreness: 5 });
    assert.equal(bad, -15);
  });
});
