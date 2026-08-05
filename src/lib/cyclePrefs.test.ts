import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';
import {
  CYCLE_PREFS_KEY,
  clampCycleLength,
  cycleDayIndex,
  cycleReadinessBias,
  cycleCueMessageKey,
  estimateCyclePhase,
  loadCyclePrefs,
  normalizeCyclePrefs,
  saveCyclePrefs,
  type CyclePrefs,
} from '@/lib/cyclePrefs';

/** Fixture “today” relative to period start — no absolute date literals that expire. */
function todayFromStart(start: string, dayOffset: number): string {
  const [y, m, d] = start.split('-').map(Number);
  const date = new Date(y, m - 1, d + dayOffset);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

describe('cyclePrefs', () => {
  const store = new Map<string, string>();
  let hadWindow: boolean;
  const START = '2020-01-15'; // fixed anchor for relative offsets only

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
    if (!hadWindow) delete (globalThis as { window?: unknown }).window;
  });

  it('defaults off and never invents a period', () => {
    const p = loadCyclePrefs();
    assert.equal(p.enabled, false);
    assert.equal(p.lastPeriodStart, undefined);
    assert.equal(estimateCyclePhase(p, todayFromStart(START, 0)), 'unknown');
    assert.equal(cycleReadinessBias(p, todayFromStart(START, 0)), 0);
  });

  it('round-trips enabled prefs', () => {
    const prefs: CyclePrefs = {
      enabled: true,
      lastPeriodStart: START,
      typicalLengthDays: 30,
    };
    assert.equal(saveCyclePrefs(prefs), true);
    assert.ok(store.get(CYCLE_PREFS_KEY));
    const loaded = loadCyclePrefs();
    assert.equal(loaded.enabled, true);
    assert.equal(loaded.lastPeriodStart, START);
    assert.equal(loaded.typicalLengthDays, 30);
  });

  it('clamps cycle length to 21–45', () => {
    assert.equal(clampCycleLength(10), 21);
    assert.equal(clampCycleLength(50), 45);
    assert.equal(clampCycleLength(28), 28);
    assert.equal(normalizeCyclePrefs({ enabled: true, typicalLengthDays: 99 }).typicalLengthDays, 45);
  });

  it('estimates educational phase windows from day index', () => {
    const prefs: CyclePrefs = {
      enabled: true,
      lastPeriodStart: START,
      typicalLengthDays: 28,
    };
    // day 1 = start
    assert.equal(cycleDayIndex(prefs, todayFromStart(START, 0)), 1);
    assert.equal(estimateCyclePhase(prefs, todayFromStart(START, 0)), 'menstrual');
    assert.equal(estimateCyclePhase(prefs, todayFromStart(START, 4)), 'menstrual');
    assert.equal(estimateCyclePhase(prefs, todayFromStart(START, 5)), 'follicular');
    assert.equal(estimateCyclePhase(prefs, todayFromStart(START, 12)), 'follicular');
    assert.equal(estimateCyclePhase(prefs, todayFromStart(START, 13)), 'ovulatory');
    assert.equal(estimateCyclePhase(prefs, todayFromStart(START, 15)), 'ovulatory');
    assert.equal(estimateCyclePhase(prefs, todayFromStart(START, 16)), 'luteal');
    assert.equal(estimateCyclePhase(prefs, todayFromStart(START, 27)), 'luteal');
    // wraps
    assert.equal(cycleDayIndex(prefs, todayFromStart(START, 28)), 1);
    assert.equal(estimateCyclePhase(prefs, todayFromStart(START, 28)), 'menstrual');
  });

  it('applies soft readiness bias only when enabled and known', () => {
    const off: CyclePrefs = { enabled: false, lastPeriodStart: START };
    assert.equal(cycleReadinessBias(off, todayFromStart(START, 0)), 0);

    const on: CyclePrefs = {
      enabled: true,
      lastPeriodStart: START,
      typicalLengthDays: 28,
    };
    assert.equal(cycleReadinessBias(on, todayFromStart(START, 0)), -8); // menstrual
    assert.equal(cycleReadinessBias(on, todayFromStart(START, 8)), 0); // follicular
    assert.equal(cycleReadinessBias(on, todayFromStart(START, 14)), 0); // ovulatory
    assert.equal(cycleReadinessBias(on, todayFromStart(START, 20)), 0); // early luteal
    assert.equal(cycleReadinessBias(on, todayFromStart(START, 25)), -5); // late luteal (day 26, length-3=25)
  });

  it('maps phases to cue keys', () => {
    assert.equal(cycleCueMessageKey('menstrual'), 'cycleCueMenstrual');
    assert.equal(cycleCueMessageKey('unknown'), null);
  });

  it('disabled with date still unknown phase', () => {
    const p = normalizeCyclePrefs({
      enabled: false,
      lastPeriodStart: START,
    });
    assert.equal(estimateCyclePhase(p, todayFromStart(START, 2)), 'unknown');
  });
});
