'use client';

/**
 * Client referral helpers — code cache for share URLs; redeem on sign-in.
 */

import { loadAttribution } from '@/lib/attribution';
import { enqueueReferralRedeem } from '@/lib/sync/attributionSync';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

export const REFERRAL_CODE_KEY = STORAGE_KEYS.referralCode;

export type MyReferral = { code: string; recruitCount: number };

export async function getMyReferral(): Promise<MyReferral | null> {
  try {
    const res = await fetch('/api/referral', { credentials: 'same-origin' });
    if (!res.ok) return null;
    const data = (await res.json()) as { code?: string; recruitCount?: number };
    if (!data.code) return null;
    writeRaw(REFERRAL_CODE_KEY, data.code);
    return { code: data.code, recruitCount: data.recruitCount ?? 0 };
  } catch {
    return null;
  }
}

export function getCachedReferralCode(): string | null {
  return readRaw(REFERRAL_CODE_KEY);
}

/**
 * Queue the referral redeem after sign-in push — redeems mw_attribution.ref once.
 *
 * `.218` moved this onto the durable outbox. It was a one-shot `fetch` with a
 * swallowing catch, so a redeem lost to a flaky signal was lost permanently.
 */
export function redeemReferralFromAttribution(): void {
  if (typeof window === 'undefined') return;
  const attr = loadAttribution();
  const code = attr?.ref?.trim();
  if (!code || !/^MW-[A-HJ-NP-Z2-9]{5}$/.test(code)) return;
  enqueueReferralRedeem(code);
}
