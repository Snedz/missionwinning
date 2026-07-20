'use client';

/**
 * Client beta-invite helpers — land mark + redeem on sign-in.
 */

import { loadAttribution } from '@/lib/attribution';
import { track } from '@/lib/analytics';
import { INVITE_CODE_RE } from '@/lib/inviteCode';

/** Fire-and-forget after captureAttribution stores a new invite. */
export function markInviteLanded(code: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = code.trim();
  if (!INVITE_CODE_RE.test(trimmed)) return;

  void fetch('/api/beta/invites/landed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: trimmed }),
  }).catch(() => {
    /* non-fatal */
  });
}

/** Fire-and-forget after sign-in push — redeems mw_attribution.invite once. */
export function redeemInviteFromAttribution(): void {
  if (typeof window === 'undefined') return;
  const attr = loadAttribution();
  const code = attr?.invite?.trim();
  if (!code || !INVITE_CODE_RE.test(code)) return;

  void fetch('/api/beta/invites/redeem', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
    .then(async (res) => {
      if (!res.ok) return;
      const data = (await res.json().catch(() => null)) as { status?: string } | null;
      if (data?.status === 'attributed') {
        track('beta_invite_attributed');
      }
    })
    .catch(() => {
      /* non-fatal */
    });
}
