/** COPPA-lite parent consent for athletes under 13. Local-only until verified email flow. */

export const COPPA_AGE_THRESHOLD = 13;

const CONSENT_KEY = 'mw_youth_parent_consent';

export type YouthConsentRecord = {
  parentEmail: string;
  childAge: number;
  consentedAt: string;
};

export function requiresYouthConsent(age: number): boolean {
  return Number.isFinite(age) && age > 0 && age < COPPA_AGE_THRESHOLD;
}

export function hasYouthConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as YouthConsentRecord;
    return Boolean(parsed.parentEmail && parsed.consentedAt);
  } catch {
    return false;
  }
}

export function getYouthConsent(): YouthConsentRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as YouthConsentRecord;
  } catch {
    return null;
  }
}

export function saveYouthConsent(record: Omit<YouthConsentRecord, 'consentedAt'>): YouthConsentRecord {
  const full: YouthConsentRecord = {
    ...record,
    consentedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(full));
  }
  return full;
}

export function isValidParentEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
