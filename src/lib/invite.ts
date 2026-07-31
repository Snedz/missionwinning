'use client';

/**
 * Client beta-invite helpers — land mark + redeem on sign-in.
 *
 * `.218` moved both onto the durable outbox. They were one-shot `fetch` calls
 * with a swallowing catch, on the one path that decides whether the beta gate
 * ever goes green — see `sync/attributionSync.ts` for the full account.
 */

import { loadAttribution } from '@/lib/attribution';
import { INVITE_CODE_RE } from '@/lib/inviteCode';
import { enqueueInviteLanded, enqueueInviteRedeem } from '@/lib/sync/attributionSync';

/** Queue the landing mark after captureAttribution stores a new invite. */
export function markInviteLanded(code: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = code.trim();
  if (!INVITE_CODE_RE.test(trimmed)) return;
  enqueueInviteLanded(trimmed);
}

/** Queue the redeem after sign-in push — redeems mw_attribution.invite once. */
export function redeemInviteFromAttribution(): void {
  if (typeof window === 'undefined') return;
  const attr = loadAttribution();
  const code = attr?.invite?.trim();
  if (!code || !INVITE_CODE_RE.test(code)) return;
  enqueueInviteRedeem(code);
}
