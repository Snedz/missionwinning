import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  ATTRIBUTION_KEY,
  attributionAsProps,
  captureAttribution,
  loadAttribution,
} from '@/lib/attribution';

describe('attribution', () => {
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
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: { pathname: '/', search: '', href: 'http://localhost/' },
    });
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { referrer: 'https://t.co/x' },
    });
  });

  afterEach(() => {
    if (!hadWindow) {
      delete (globalThis as { window?: unknown }).window;
    }
  });

  it('captures first-touch utm and path', () => {
    const a = captureAttribution('?utm_source=twitter&utm_campaign=launch', {
      path: '/?utm_source=twitter',
      referrer: 'https://t.co/x',
    });
    assert.equal(a?.utm_source, 'twitter');
    assert.equal(a?.utm_campaign, 'launch');
    assert.equal(a?.referrer, 'https://t.co/x');
    assert.ok(a?.captured_at);
    assert.equal(loadAttribution()?.utm_source, 'twitter');
  });

  it('does not overwrite first touch', () => {
    captureAttribution('?utm_source=twitter');
    captureAttribution('?utm_source=reddit');
    assert.equal(loadAttribution()?.utm_source, 'twitter');
  });

  it('flattens props without captured_at', () => {
    store.set(
      ATTRIBUTION_KEY,
      JSON.stringify({ utm_source: 'x', captured_at: '2026-01-01' })
    );
    const props = attributionAsProps(loadAttribution());
    assert.equal(props.utm_source, 'x');
    assert.equal(props.captured_at, undefined);
  });
});
