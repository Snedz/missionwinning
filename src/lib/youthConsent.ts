/** COPPA-lite parent consent for athletes under 13. */

export const COPPA_AGE_THRESHOLD = 13;

const CONSENT_KEY = 'mw_youth_parent_consent';

export type YouthConsentRecord = {
  parentEmail: string;
  childAge: number;
  consentedAt: string;
  verified: boolean;
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
    return Boolean(parsed.parentEmail && parsed.consentedAt && parsed.verified);
  } catch {
    return false;
  }
}

export function hasPendingYouthConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as YouthConsentRecord;
    return Boolean(parsed.parentEmail && !parsed.verified);
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

export function saveYouthConsent(
  record: Omit<YouthConsentRecord, 'consentedAt' | 'verified'> & {
    consentedAt?: string;
    verified?: boolean;
  }
): YouthConsentRecord {
  const existing = getYouthConsent();
  const full: YouthConsentRecord = {
    parentEmail: record.parentEmail,
    childAge: record.childAge,
    consentedAt: record.consentedAt ?? existing?.consentedAt ?? new Date().toISOString(),
    verified: record.verified ?? existing?.verified ?? false,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(full));
  }
  return full;
}

export function markYouthConsentVerified(): YouthConsentRecord | null {
  const existing = getYouthConsent();
  if (!existing) return null;
  return saveYouthConsent({ ...existing, verified: true });
}

export function isValidParentEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
