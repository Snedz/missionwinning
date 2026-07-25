/** Privacy-by-design: record explicit Terms + Privacy acceptance before sign-in. */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

const CONSENT_KEY = STORAGE_KEYS.privacyConsent;

export type PrivacyConsent = {
  acceptedAt: string;
  termsVersion: string;
  privacyVersion: string;
};

const CURRENT_TERMS_VERSION = '2025-06-29';
const CURRENT_PRIVACY_VERSION = '2025-06-29';

export function loadPrivacyConsent(): PrivacyConsent | null {
  return readJson<PrivacyConsent | null>(CONSENT_KEY, null);
}

export function savePrivacyConsent(): PrivacyConsent {
  const record: PrivacyConsent = {
    acceptedAt: new Date().toISOString(),
    termsVersion: CURRENT_TERMS_VERSION,
    privacyVersion: CURRENT_PRIVACY_VERSION,
  };
  writeJson(CONSENT_KEY, record);
  return record;
}

export function hasValidPrivacyConsent(): boolean {
  const c = loadPrivacyConsent();
  if (!c) return false;
  return c.termsVersion === CURRENT_TERMS_VERSION && c.privacyVersion === CURRENT_PRIVACY_VERSION;
}

export { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION };
