'use client';

/**
 * Client referral helpers — code cache for share URLs; redeem on sign-in.
 */

import { loadAttribution } from '@/lib/attribution';
import { track } from '@/lib/analytics';

export const REFERRAL_CODE_KEY = 'mw_referral_code';

export type MyReferral = { code: string; recruitCount: number };

export async function getMyReferral(): Promise<MyReferral | null> {
  try {
    const res = await fetch('/api/referral', { credentials: 'same-origin' });
    if (!res.ok) return null;
    const data = (await res.json()) as { code?: string; recruitCount?: number };
    if (!data.code) return null;
    try {
      localStorage.setItem(REFERRAL_CODE_KEY, data.code);
    } catch {
      /* private mode */
    }
    return { code: data.code, recruitCount: data.recruitCount ?? 0 };
  } catch {
    return null;
  }
}

export function getCachedReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(REFERRAL_CODE_KEY);
  } catch {
    return null;
  }
}

/** Fire-and-forget after sign-in push — redeems mw_attribution.ref once. */
export function redeemReferralFromAttribution(): void {
  if (typeof window === 'undefined') return;
  const attr = loadAttribution();
  const code = attr?.ref?.trim();
  if (!code || !/^MW-[A-HJ-NP-Z2-9]{5}$/.test(code)) return;

  void fetch('/api/referral', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
    .then(async (res) => {
      if (!res.ok) return;
      const data = (await res.json().catch(() => null)) as { status?: string } | null;
      if (data?.status === 'attributed') {
        track('referral_attributed');
      }
    })
    .catch(() => {
      /* non-fatal */
    });
}
