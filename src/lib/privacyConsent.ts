/** Privacy-by-design: record explicit Terms + Privacy acceptance before sign-in. */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

const CONSENT_KEY = STORAGE_KEYS.privacyConsent;

export type PrivacyConsent = {
  acceptedAt: string;
  termsVersion: string;
  privacyVersion: string;
};

/**
 * Two dates, on purpose (`.609`).
 *
 * These used to be one constant each, doing two jobs: the pages rendered it as
 * "Last updated", and `hasValidPrivacyConsent()` compared it. The old comment
 * called that a feature — *"One source: date shown === version consented to."*
 * In practice it is a lock on the policy. Fixing a typo, clarifying a sentence,
 * or naming one new field means either **re-prompting every device on earth for
 * consent**, or shipping a policy whose stated date is a lie. Faced with that,
 * nobody edits the policy — which is how a privacy page goes stale, and a stale
 * privacy page is the failure the whole consent record exists to prevent.
 *
 * So: `*_DISPLAY_DATE` is what the page shows and moves on **any** edit.
 * `*_CONSENT_VERSION` is what consent compares and moves only on a **material**
 * change — new data collected, a new purpose, a new recipient.
 *
 * The invariant that keeps them honest is asserted in the test: the consent
 * version may never be *newer* than the displayed date. A user must never be
 * asked to accept a version the page has not yet admitted to publishing.
 */
const TERMS_DISPLAY_DATE = '2026-08-04';
const PRIVACY_DISPLAY_DATE = '2026-08-04';

/** Material changes only. Bumping this re-prompts every device — see above. */
const TERMS_CONSENT_VERSION = '2026-08-04';
const PRIVACY_CONSENT_VERSION = '2026-08-04';

export function loadPrivacyConsent(): PrivacyConsent | null {
  return readJson<PrivacyConsent | null>(CONSENT_KEY, null);
}

export function savePrivacyConsent(): PrivacyConsent {
  const record: PrivacyConsent = {
    acceptedAt: new Date().toISOString(),
    termsVersion: TERMS_CONSENT_VERSION,
    privacyVersion: PRIVACY_CONSENT_VERSION,
  };
  writeJson(CONSENT_KEY, record);
  return record;
}

/**
 * Consent validity is a function of the **consent versions only**. The display
 * dates are deliberately not referenced here; if they ever are, editing prose
 * starts logging people out of their own consent again.
 */
export function hasValidPrivacyConsent(): boolean {
  const c = loadPrivacyConsent();
  if (!c) return false;
  return c.termsVersion === TERMS_CONSENT_VERSION && c.privacyVersion === PRIVACY_CONSENT_VERSION;
}

export {
  TERMS_DISPLAY_DATE,
  PRIVACY_DISPLAY_DATE,
  TERMS_CONSENT_VERSION,
  PRIVACY_CONSENT_VERSION,
};
