/** Privacy-by-design: record explicit Terms + Privacy acceptance before sign-in. */

const CONSENT_KEY = 'mw_privacy_consent_v1';

export type PrivacyConsent = {
  acceptedAt: string;
  termsVersion: string;
  privacyVersion: string;
};

const CURRENT_TERMS_VERSION = '2025-06-29';
const CURRENT_PRIVACY_VERSION = '2025-06-29';

export function loadPrivacyConsent(): PrivacyConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PrivacyConsent;
  } catch {
    return null;
  }
}

export function savePrivacyConsent(): PrivacyConsent {
  const record: PrivacyConsent = {
    acceptedAt: new Date().toISOString(),
    termsVersion: CURRENT_TERMS_VERSION,
    privacyVersion: CURRENT_PRIVACY_VERSION,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  }
  return record;
}

export function hasValidPrivacyConsent(): boolean {
  const c = loadPrivacyConsent();
  if (!c) return false;
  return c.termsVersion === CURRENT_TERMS_VERSION && c.privacyVersion === CURRENT_PRIVACY_VERSION;
}

export { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION };
