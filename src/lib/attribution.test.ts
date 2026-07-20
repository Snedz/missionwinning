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
    const { attribution: a } = captureAttribution('?utm_source=twitter&utm_campaign=launch', {
      path: '/?utm_source=twitter',
      referrer: 'https://t.co/x',
    });
    assert.equal(a?.utm_source, 'twitter');
    assert.equal(a?.utm_campaign, 'launch');
    assert.equal(a?.referrer, 'https://t.co/x');
    assert.ok(a?.captured_at);
    assert.equal(loadAttribution()?.utm_source, 'twitter');
  });

  it('does not overwrite first touch UTMs', () => {
    captureAttribution('?utm_source=twitter');
    captureAttribution('?utm_source=reddit');
    assert.equal(loadAttribution()?.utm_source, 'twitter');
  });

  it('captures ref on first touch', () => {
    const { attribution: a, referralLanded, inviteLanded } = captureAttribution('?ref=MW-ABC12');
    assert.equal(a?.ref, 'MW-ABC12');
    assert.equal(referralLanded, true);
    assert.equal(inviteLanded, false);
  });

  it('captures invite on first touch', () => {
    const { attribution: a, inviteLanded, referralLanded } = captureAttribution(
      '?invite=MW-B-ABC12'
    );
    assert.equal(a?.invite, 'MW-B-ABC12');
    assert.equal(inviteLanded, true);
    assert.equal(referralLanded, false);
  });

  it('backfills ref onto existing first-touch without clobbering UTMs', () => {
    captureAttribution('?utm_source=twitter&utm_campaign=launch');
    const { attribution: a, referralLanded } = captureAttribution('?ref=MW-XYZ99&utm_source=reddit');
    assert.equal(referralLanded, true);
    assert.equal(a?.ref, 'MW-XYZ99');
    assert.equal(a?.utm_source, 'twitter');
    assert.equal(a?.utm_campaign, 'launch');
  });

  it('backfills invite onto existing first-touch without clobbering UTMs or ref', () => {
    captureAttribution('?utm_source=twitter&ref=MW-ABC12');
    const { attribution: a, inviteLanded, referralLanded } = captureAttribution(
      '?invite=MW-B-XYZ99&utm_source=reddit'
    );
    assert.equal(inviteLanded, true);
    assert.equal(referralLanded, false);
    assert.equal(a?.invite, 'MW-B-XYZ99');
    assert.equal(a?.ref, 'MW-ABC12');
    assert.equal(a?.utm_source, 'twitter');
  });

  it('does not overwrite an existing ref', () => {
    captureAttribution('?ref=MW-FIRST');
    const { referralLanded } = captureAttribution('?ref=MW-SECOND');
    assert.equal(referralLanded, false);
    assert.equal(loadAttribution()?.ref, 'MW-FIRST');
  });

  it('does not overwrite an existing invite', () => {
    captureAttribution('?invite=MW-B-FIRST');
    const { inviteLanded } = captureAttribution('?invite=MW-B-SECON');
    assert.equal(inviteLanded, false);
    assert.equal(loadAttribution()?.invite, 'MW-B-FIRST');
  });

  it('flattens props without captured_at', () => {
    store.set(
      ATTRIBUTION_KEY,
      JSON.stringify({
        utm_source: 'x',
        ref: 'MW-ABC12',
        invite: 'MW-B-ABC12',
        captured_at: '2026-01-01',
      })
    );
    const props = attributionAsProps(loadAttribution());
    assert.equal(props.utm_source, 'x');
    assert.equal(props.ref, 'MW-ABC12');
    assert.equal(props.invite, 'MW-B-ABC12');
    assert.equal(props.captured_at, undefined);
  });
});
