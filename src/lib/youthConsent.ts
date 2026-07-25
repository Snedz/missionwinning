/** COPPA-lite parent consent for athletes under 13. */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

export const COPPA_AGE_THRESHOLD = 13;

const CONSENT_KEY = STORAGE_KEYS.youthParentConsent;

export type YouthConsentRecord = {
  parentEmail: string;
  childAge: number;
  consentedAt: string;
  verified: boolean;
};

export function requiresYouthConsent(age: number): boolean {
  return Number.isFinite(age) && age > 0 && age < COPPA_AGE_THRESHOLD;
}

export function getYouthConsent(): YouthConsentRecord | null {
  return readJson<YouthConsentRecord | null>(CONSENT_KEY, null);
}

export function hasYouthConsent(): boolean {
  const record = getYouthConsent();
  return Boolean(record?.parentEmail && record.consentedAt && record.verified);
}

export function hasPendingYouthConsent(): boolean {
  const record = getYouthConsent();
  return Boolean(record?.parentEmail && !record.verified);
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
  writeJson(CONSENT_KEY, full);
  return full;
}

export function markYouthConsentVerified(): YouthConsentRecord | null {
  const existing = getYouthConsent();
  if (!existing) return null;
  return saveYouthConsent({ ...existing, verified: true });
}

/** Merge verified consent from server when athlete is signed in (cross-device). */
export async function mergeYouthConsentFromServer(): Promise<boolean> {
  if (typeof window === 'undefined') return hasYouthConsent();
  try {
    const res = await fetch('/api/youth/consent-status');
    if (!res.ok) return hasYouthConsent();
    const data = (await res.json()) as {
      verified?: boolean;
      parentEmail?: string;
      childAge?: number;
    };
    if (data.verified && data.parentEmail && data.childAge != null) {
      saveYouthConsent({
        parentEmail: data.parentEmail,
        childAge: data.childAge,
        verified: true,
      });
      return true;
    }
    return hasYouthConsent();
  } catch {
    return hasYouthConsent();
  }
}

export function isValidParentEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
