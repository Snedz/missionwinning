import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRIVACY_CONSENT_VERSION,
  PRIVACY_DISPLAY_DATE,
  TERMS_CONSENT_VERSION,
  TERMS_DISPLAY_DATE,
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

  it('all four dates are ISO', () => {
    for (const [name, v] of [
      ['TERMS_DISPLAY_DATE', TERMS_DISPLAY_DATE],
      ['PRIVACY_DISPLAY_DATE', PRIVACY_DISPLAY_DATE],
      ['TERMS_CONSENT_VERSION', TERMS_CONSENT_VERSION],
      ['PRIVACY_CONSENT_VERSION', PRIVACY_CONSENT_VERSION],
    ] as const) {
      assert.match(v, /^\d{4}-\d{2}-\d{2}$/, name);
    }
  });

  /**
   * `.608` — the display date and the consent version were one constant, which
   * made every prose edit a global re-consent prompt. Nobody edits a policy
   * under that rule, and a stale privacy page is the exact failure the consent
   * record exists to prevent.
   *
   * The invariant: a user may never be asked to accept a version the page has
   * not yet admitted to publishing. So the consent version may lag the shown
   * date (prose edits since the last material change) but must never lead it.
   */
  it('the consent version never leads the date the page displays', () => {
    assert.ok(
      PRIVACY_CONSENT_VERSION <= PRIVACY_DISPLAY_DATE,
      `privacy consent version ${PRIVACY_CONSENT_VERSION} is newer than the displayed ` +
        `${PRIVACY_DISPLAY_DATE} — a material change must also update the date on the page`
    );
    assert.ok(TERMS_CONSENT_VERSION <= TERMS_DISPLAY_DATE, 'same for terms');
  });

  /**
   * The structural half, and the one that actually holds the fix in place.
   *
   * Every assertion above passes just as well when the two constants are equal —
   * which they are today — so none of them can see the coupling come back. This
   * reads the source: `hasValidPrivacyConsent` must not mention a display date.
   * Reintroduce one and editing prose starts logging people out of their own
   * consent again, silently, with the whole suite green.
   */
  it('consent validity does not read the displayed dates', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const src = readFileSync(
      path.join(import.meta.dirname, 'privacyConsent.ts'),
      'utf8'
    );
    const start = src.indexOf('export function hasValidPrivacyConsent');
    assert.notEqual(start, -1, 'hasValidPrivacyConsent not found — this guard is reading nothing');
    const body = src.slice(start, src.indexOf('\n}', start));
    assert.doesNotMatch(
      body,
      /DISPLAY_DATE/,
      'hasValidPrivacyConsent compares a display date — that is the coupling .608 removed'
    );
    assert.match(body, /CONSENT_VERSION/, 'it must still compare the consent versions');
  });

  it('no stored record → no valid consent', () => {
    assert.equal(hasValidPrivacyConsent(), false);
  });

  it('savePrivacyConsent records the current versions and validates', () => {
    const record = savePrivacyConsent();
    assert.equal(record.termsVersion, TERMS_CONSENT_VERSION);
    assert.equal(record.privacyVersion, PRIVACY_CONSENT_VERSION);
    assert.equal(hasValidPrivacyConsent(), true);
    assert.equal(loadPrivacyConsent()?.privacyVersion, PRIVACY_CONSENT_VERSION);
  });

  it('a record from an older policy version re-prompts (no date literals — stale derives from current)', () => {
    store.set(
      STORAGE_KEYS.privacyConsent,
      JSON.stringify({
        acceptedAt: new Date().toISOString(),
        termsVersion: TERMS_CONSENT_VERSION,
        privacyVersion: `${PRIVACY_CONSENT_VERSION}-old`,
      })
    );
    assert.equal(hasValidPrivacyConsent(), false);
  });

  it('both documents must match — stale terms alone invalidates', () => {
    store.set(
      STORAGE_KEYS.privacyConsent,
      JSON.stringify({
        acceptedAt: new Date().toISOString(),
        termsVersion: `${TERMS_CONSENT_VERSION}-old`,
        privacyVersion: PRIVACY_CONSENT_VERSION,
      })
    );
    assert.equal(hasValidPrivacyConsent(), false);
  });
});
