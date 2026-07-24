import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import type { CompletedWorkoutLog } from '@/types';
import {
  adaptDeltaSummary,
  FUEL_ADAPT_ENABLED_KEY,
  loadFuelAdaptEnabled,
  resolveFuelDayTargets,
  saveFuelAdaptEnabled,
  trainingLoadLabel,
} from './fuelDayAdapt.ts';

const base = { cals: 2200, protein: 160, carbs: 200, fat: 70 };

function log(completedAt: string, totalVolume: number): CompletedWorkoutLog {
  return {
    id: `w-${completedAt}`,
    workoutName: 'Session',
    startedAt: completedAt,
    completedAt,
    durationSeconds: 3600,
    totalVolume,
    exercises: [],
  };
}

describe('fuelDayAdapt', () => {
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
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
      },
    });
  });

  afterEach(() => {
    if (!hadWindow) delete (globalThis as { window?: unknown }).window;
  });

  it('bumps targets on heavy training day', () => {
    // Monday week of 2026-07-20; heavy log on Wednesday 2026-07-22
    const r = resolveFuelDayTargets(base, [log('2026-07-22T18:00:00.000Z', 5000)], {
      todayIso: '2026-07-22',
      weekStart: '2026-07-20',
      adapt: true,
    });
    assert.equal(r.load, 'heavy');
    assert.equal(r.isAdapted, true);
    assert.equal(r.targets.cals, base.cals + 200);
    assert.equal(r.targets.carbs, base.carbs + 40);
    assert.ok(r.note);
  });

  it('returns base when adapt disabled', () => {
    const r = resolveFuelDayTargets(base, [log('2026-07-22T18:00:00.000Z', 5000)], {
      todayIso: '2026-07-22',
      weekStart: '2026-07-20',
      adapt: false,
    });
    assert.equal(r.load, 'heavy');
    assert.equal(r.isAdapted, false);
    assert.deepEqual(r.targets, base);
  });

  it('rest day trims carbs when adapt on', () => {
    const r = resolveFuelDayTargets(base, [], {
      todayIso: '2026-07-22',
      weekStart: '2026-07-20',
      adapt: true,
    });
    assert.equal(r.load, 'rest');
    assert.ok(r.targets.cals < base.cals);
    assert.ok(r.targets.carbs < base.carbs);
  });

  it('persist adapt preference', () => {
    assert.equal(loadFuelAdaptEnabled(), true);
    saveFuelAdaptEnabled(false);
    assert.equal(loadFuelAdaptEnabled(), false);
    assert.equal(store.get(FUEL_ADAPT_ENABLED_KEY), '0');
    saveFuelAdaptEnabled(true);
    assert.equal(loadFuelAdaptEnabled(), true);
  });

  it('labels and delta summary', () => {
    assert.equal(trainingLoadLabel('heavy'), 'Heavy');
    assert.equal(trainingLoadLabel('rest'), 'Rest');
    const delta = adaptDeltaSummary(base, { ...base, cals: 2400, carbs: 240 });
    assert.ok(delta.includes('+200 kcal'));
    assert.ok(delta.includes('+40g C'));
  });
});
