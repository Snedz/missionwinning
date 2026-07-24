import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeGoalTargets,
  defaultBodyweightForWizard,
  FUEL_GOAL_STORAGE_KEY,
  goalChoiceToMacro,
  loadFuelGoalChoice,
  macroToGoalChoice,
  saveFuelGoalChoice,
} from './fuelGoalWizard.ts';

describe('fuelGoalWizard', () => {
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

  it('maps lose/gain to cut/bulk', () => {
    assert.equal(goalChoiceToMacro('lose'), 'cut');
    assert.equal(goalChoiceToMacro('gain'), 'bulk');
    assert.equal(goalChoiceToMacro('maintain'), 'maintain');
    assert.equal(macroToGoalChoice('cut'), 'lose');
    assert.equal(macroToGoalChoice('bulk'), 'gain');
  });

  it('cut calories under maintain, bulk over', () => {
    const base = {
      bodyweight: 82,
      height: 178,
      age: 28,
      sex: 'male' as const,
      activity: 1.55,
      units: 'metric' as const,
    };
    const maintain = computeGoalTargets({ ...base, goal: 'maintain' });
    const lose = computeGoalTargets({ ...base, goal: 'lose' });
    const gain = computeGoalTargets({ ...base, goal: 'gain' });

    assert.ok(lose.cals < maintain.cals);
    assert.ok(gain.cals > maintain.cals);
    assert.equal(lose.cals, Math.round(maintain.tdee * 0.85));
    assert.equal(gain.cals, Math.round(maintain.tdee * 1.1));
    assert.equal(maintain.cals, maintain.tdee);
    assert.ok(lose.protein > 0 && lose.carbs >= 0 && lose.fat > 0);
  });

  it('persists goal choice', () => {
    saveFuelGoalChoice('lose');
    assert.equal(loadFuelGoalChoice(), 'lose');
    assert.equal(store.get(FUEL_GOAL_STORAGE_KEY), 'lose');
  });

  it('reads legacy cut/bulk storage', () => {
    store.set(FUEL_GOAL_STORAGE_KEY, 'cut');
    assert.equal(loadFuelGoalChoice(), 'lose');
    store.set(FUEL_GOAL_STORAGE_KEY, 'bulk');
    assert.equal(loadFuelGoalChoice(), 'gain');
  });

  it('default bodyweight from kg metric/imperial', () => {
    assert.equal(defaultBodyweightForWizard('metric', 80), 80);
    const lb = defaultBodyweightForWizard('imperial', 80);
    assert.ok(lb > 175 && lb < 178);
  });
});
