import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
  hasValidPrivacyConsent,
  loadPrivacyConsent,
  savePrivacyConsent,
} from '@/lib/privacyConsent';
import { STORAGE_KEYS } from '@/lib/storage/keys';

describe('privacyConsent', () => {
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

  it('versions are ISO dates — pages render them as the Last updated date', () => {
    assert.match(CURRENT_TERMS_VERSION, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(CURRENT_PRIVACY_VERSION, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('no stored record → no valid consent', () => {
    assert.equal(hasValidPrivacyConsent(), false);
  });

  it('savePrivacyConsent records the current versions and validates', () => {
    const record = savePrivacyConsent();
    assert.equal(record.termsVersion, CURRENT_TERMS_VERSION);
    assert.equal(record.privacyVersion, CURRENT_PRIVACY_VERSION);
    assert.equal(hasValidPrivacyConsent(), true);
    assert.equal(loadPrivacyConsent()?.privacyVersion, CURRENT_PRIVACY_VERSION);
  });

  it('a record from an older policy version re-prompts (no date literals — stale derives from current)', () => {
    store.set(
      STORAGE_KEYS.privacyConsent,
      JSON.stringify({
        acceptedAt: new Date().toISOString(),
        termsVersion: CURRENT_TERMS_VERSION,
        privacyVersion: `${CURRENT_PRIVACY_VERSION}-old`,
      })
    );
    assert.equal(hasValidPrivacyConsent(), false);
  });

  it('both documents must match — stale terms alone invalidates', () => {
    store.set(
      STORAGE_KEYS.privacyConsent,
      JSON.stringify({
        acceptedAt: new Date().toISOString(),
        termsVersion: `${CURRENT_TERMS_VERSION}-old`,
        privacyVersion: CURRENT_PRIVACY_VERSION,
      })
    );
    assert.equal(hasValidPrivacyConsent(), false);
  });
});
