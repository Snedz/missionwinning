import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  ANALYTICS_PREF_KEY,
  isAnalyticsAllowed,
  loadAnalyticsPreference,
  saveAnalyticsPreference,
  shouldShowAnalyticsBanner,
} from '@/lib/analyticsOptOut';

describe('analyticsOptOut', () => {
  const store = new Map<string, string>();
  let dnt: string | null = null;
  let originalLocalStorage: Storage | undefined;
  let originalDnt: string | null | undefined;
  let hadWindow: boolean;

  beforeEach(() => {
    store.clear();
    dnt = null;
    hadWindow = typeof globalThis.window !== 'undefined';
    const memStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
      key: () => null,
      get length() {
        return store.size;
      },
    } as Storage;

    if (!hadWindow) {
      (globalThis as unknown as { window: typeof globalThis }).window = globalThis;
    }
    originalLocalStorage = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: memStorage,
    });
    if (typeof globalThis.navigator === 'undefined') {
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: {},
      });
    }
    originalDnt = (globalThis.navigator as { doNotTrack?: string | null }).doNotTrack ?? null;
    Object.defineProperty(globalThis.navigator, 'doNotTrack', {
      configurable: true,
      get: () => dnt,
    });
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
  });

  afterEach(() => {
    if (originalLocalStorage !== undefined) {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        writable: true,
        value: originalLocalStorage,
      });
    }
    Object.defineProperty(globalThis.navigator, 'doNotTrack', {
      configurable: true,
      value: originalDnt,
    });
    if (!hadWindow) {
      delete (globalThis as { window?: unknown }).window;
    }
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
  });

  it('defaults to no preference (privacy until explicit choice)', () => {
    assert.equal(loadAnalyticsPreference(), null);
    assert.equal(isAnalyticsAllowed(), false);
  });

  it('allows analytics only after explicit allow', () => {
    saveAnalyticsPreference('allowed');
    assert.equal(loadAnalyticsPreference(), 'allowed');
    assert.equal(store.get(ANALYTICS_PREF_KEY), 'allowed');
    assert.equal(isAnalyticsAllowed(), true);
  });

  it('blocks when opted out', () => {
    saveAnalyticsPreference('opted_out');
    assert.equal(isAnalyticsAllowed(), false);
  });

  it('hard-blocks when Do Not Track is set', () => {
    saveAnalyticsPreference('allowed');
    dnt = '1';
    assert.equal(isAnalyticsAllowed(), false);
  });

  it('shows banner only when PostHog key is set and undecided', () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test';
    assert.equal(shouldShowAnalyticsBanner(), true);
    saveAnalyticsPreference('opted_out');
    assert.equal(shouldShowAnalyticsBanner(), false);
  });

  it('hides banner when no PostHog key', () => {
    assert.equal(shouldShowAnalyticsBanner(), false);
  });

  it('hides banner under DNT', () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test';
    dnt = '1';
    assert.equal(shouldShowAnalyticsBanner(), false);
  });

  it('force query shows the banner without a PostHog key when undecided', () => {
    const prev = globalThis.window?.location;
    Object.defineProperty(globalThis.window, 'location', {
      configurable: true,
      value: { search: '?mw_force_consent=1' },
    });
    try {
      assert.equal(shouldShowAnalyticsBanner(), true);
      saveAnalyticsPreference('opted_out');
      assert.equal(shouldShowAnalyticsBanner(), false);
    } finally {
      if (prev !== undefined) {
        Object.defineProperty(globalThis.window, 'location', {
          configurable: true,
          value: prev,
        });
      }
    }
  });
});
