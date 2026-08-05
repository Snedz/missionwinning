import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';
import {
  getAthleteSex,
  setAthleteSex,
  isBiologicalSex,
  ATHLETE_SEX_KEY,
} from '@/lib/athleteSex';

describe('athleteSex', () => {
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
    if (!hadWindow) delete (globalThis as { window?: unknown }).window;
  });

  it('treats only male/female as biological sex', () => {
    assert.equal(isBiologicalSex('male'), true);
    assert.equal(isBiologicalSex('female'), true);
    assert.equal(isBiologicalSex('other'), false);
    assert.equal(isBiologicalSex(''), false);
    assert.equal(isBiologicalSex(null), false);
  });

  it('starts unset — never invents male', () => {
    assert.equal(getAthleteSex(), null);
  });

  it('round-trips male and female', () => {
    assert.equal(setAthleteSex('female'), true);
    assert.equal(getAthleteSex(), 'female');
    assert.equal(store.get(ATHLETE_SEX_KEY), 'female');
    assert.equal(setAthleteSex('male'), true);
    assert.equal(getAthleteSex(), 'male');
  });

  it('female and male are distinct prefs', () => {
    setAthleteSex('female');
    assert.notEqual(getAthleteSex(), 'male');
    setAthleteSex('male');
    assert.notEqual(getAthleteSex(), 'female');
  });
});
