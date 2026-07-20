import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  BODY_METRICS_KEY,
  delta,
  latest,
  loadBodyMetrics,
  saveBodyMetric,
  series,
} from './bodyMetrics.ts';

describe('bodyMetrics', () => {
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

  it('saves and loads latest', () => {
    saveBodyMetric({ date: '2026-07-01', weightKg: 80 });
    saveBodyMetric({ date: '2026-07-10', weightKg: 79.5 });
    assert.equal(latest()?.weightKg, 79.5);
    assert.equal(loadBodyMetrics().length, 2);
    assert.ok(store.get(BODY_METRICS_KEY));
  });

  it('series is chronological', () => {
    saveBodyMetric({ date: '2026-07-01', weightKg: 80 });
    saveBodyMetric({ date: '2026-07-10', weightKg: 79 });
    const s = series('weightKg');
    assert.equal(s[0].date, '2026-07-01');
    assert.equal(s[1].value, 79);
  });

  it('delta compares to older entry', () => {
    const old = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);
    const now = new Date().toISOString().slice(0, 10);
    saveBodyMetric({ date: old, weightKg: 80 });
    saveBodyMetric({ date: now, weightKg: 78 });
    const d = delta('weightKg', 7);
    assert.equal(d, -2);
  });
});
