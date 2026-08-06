/**
 * Consent is only consent if it names what was consented to.
 *
 * This record is the app's evidence that an athlete accepted the Terms and the
 * Privacy Policy *as they were worded at the time*. Storing a bare boolean would
 * make a later rewrite of either document silently inherit an old agreement, so
 * the record pins both version strings and `hasValidPrivacyConsent` re-checks
 * them rather than testing for mere presence.
 *
 * The case that matters is therefore the **stale** one: an athlete who accepted
 * the previous Terms must read as *not* consented once the version moves, so the
 * gate asks again. A test that only covered "saved → true" would pass with the
 * version comparison deleted entirely.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { writeJson, __resetForTests } from '@/lib/storage/safeStorage';
import {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
  hasValidPrivacyConsent,
  loadPrivacyConsent,
  savePrivacyConsent,
} from '@/lib/privacyConsent';

beforeEach(() => __resetForTests());

describe('loadPrivacyConsent', () => {
  it('is null before anything is accepted — never a truthy empty object', () => {
    assert.equal(loadPrivacyConsent(), null);
    assert.equal(hasValidPrivacyConsent(), false);
  });
});

describe('savePrivacyConsent', () => {
  it('records both document versions and a real timestamp', () => {
    const record = savePrivacyConsent();

    assert.equal(record.termsVersion, CURRENT_TERMS_VERSION);
    assert.equal(record.privacyVersion, CURRENT_PRIVACY_VERSION);
    // Parseable instant, not a placeholder — this is the evidence's date.
    assert.ok(Number.isFinite(Date.parse(record.acceptedAt)), `unparseable acceptedAt "${record.acceptedAt}"`);
  });

  it('persists, so consent survives a reload', () => {
    const saved = savePrivacyConsent();
    assert.deepEqual(loadPrivacyConsent(), saved);
    assert.equal(hasValidPrivacyConsent(), true);
  });
});

describe('hasValidPrivacyConsent', () => {
  it('rejects consent given against an older Terms version', () => {
    writeJson(STORAGE_KEYS.privacyConsent, {
      acceptedAt: new Date().toISOString(),
      termsVersion: 'some-older-version',
      privacyVersion: CURRENT_PRIVACY_VERSION,
    });
    assert.equal(
      hasValidPrivacyConsent(),
      false,
      'rewritten Terms must be re-accepted, not inherited'
    );
  });

  it('rejects consent given against an older Privacy version', () => {
    writeJson(STORAGE_KEYS.privacyConsent, {
      acceptedAt: new Date().toISOString(),
      termsVersion: CURRENT_TERMS_VERSION,
      privacyVersion: 'some-older-version',
    });
    assert.equal(hasValidPrivacyConsent(), false);
  });

  it('rejects a record missing its versions entirely', () => {
    writeJson(STORAGE_KEYS.privacyConsent, { acceptedAt: new Date().toISOString() });
    assert.equal(hasValidPrivacyConsent(), false, 'an unversioned record is not evidence');
  });

  it('accepts only a record matching both current versions', () => {
    writeJson(STORAGE_KEYS.privacyConsent, {
      acceptedAt: new Date().toISOString(),
      termsVersion: CURRENT_TERMS_VERSION,
      privacyVersion: CURRENT_PRIVACY_VERSION,
    });
    assert.equal(hasValidPrivacyConsent(), true);
  });
});

describe('the version constants', () => {
  it('are non-empty strings — an empty version compares equal to anything missing', () => {
    for (const [name, value] of [
      ['CURRENT_TERMS_VERSION', CURRENT_TERMS_VERSION],
      ['CURRENT_PRIVACY_VERSION', CURRENT_PRIVACY_VERSION],
    ] as const) {
      assert.equal(typeof value, 'string', `${name} must be a string`);
      assert.ok(value.trim().length > 0, `${name} is blank`);
    }
  });
});
