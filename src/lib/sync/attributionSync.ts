'use client';

/**
 * Invite and referral attribution through the outbox — `.170`'s bug, fourth
 * instance, on the one path the beta gate actually measures.
 *
 * Three calls used to be raw fire-and-forget:
 *
 * ```ts
 * void fetch('/api/beta/invites/redeem', { ... }).catch(() => { /* non-fatal *\/ });
 * ```
 *
 * One shot each. `redeemInviteFromAttribution` is called exactly once, from
 * `syncJourneyOnSignIn`, and never again — so a tester who signs in on a train,
 * in a lift, or on gym wifi loses the redemption permanently. The attribution
 * stays in `localStorage` and nothing ever retries it.
 *
 * ## Why this one mattered more than the other three
 *
 * The lost row is not the damage. `first_landed_at` and `signed_up_user_id` are
 * what the founder invite panel reads, so a dropped redeem makes the dashboard
 * report **the tester never arrived and never converted** — while they are
 * sitting there using the app. That is the instrument you steer a private beta
 * by, reporting the opposite of what happened, on the exact metric REDTEAM A5
 * fires on ("14 days… still no 10 beta users").
 *
 * `.179` already built the answer and `.170` already named it: *"that one needs
 * an outbox retry, not a polish fix."* Six kinds ride the durable outbox and
 * retry, dedupe, survive a reload and show up on the offline screen. These three
 * — the ones on the critical path — did not.
 */

import { enqueue, registerHandler } from '@/lib/sync/outbox';
import { track, type AnalyticsEvent } from '@/lib/analytics';

export interface AttributionPayload {
  code: string;
}

function isAttributionPayload(p: unknown): p is AttributionPayload {
  return !!p && typeof p === 'object' && typeof (p as { code?: unknown }).code === 'string';
}

/**
 * Map an HTTP status onto the outbox contract (`true` = done, `false` = retry).
 *
 * Exported pure because the handler around it cannot be tested without mocking
 * the network — which is precisely how the original fire-and-forget bug stayed
 * invisible for as long as it did. `feedbackDeliveryDone` exists for the same
 * reason and draws the same kind of line.
 *
 * The distinction that matters is **4xx is done, not retried**. An invalid or
 * already-redeemed code cannot become valid by asking again, so retrying it
 * would burn `MAX_ATTEMPTS` and then sit in the queue marked `stuck` — visible
 * on the offline screen, alarming, and permanent. A 5xx or a thrown fetch is the
 * opposite: the server or the network failed, and that is exactly what retry is
 * for.
 *
 * **429 and 408 are the exceptions inside 4xx, and they are not theoretical.**
 * All three of these routes rate-limit at 5/min/IP (`referral/route.ts:91`,
 * `invites/redeem/route.ts:19`), and beta testers behind one gym's wifi, one
 * office, or one carrier NAT share an IP. Treating "try again shortly" as
 * "done" would silently drop precisely the redemptions this module exists to
 * save — the original bug, reintroduced by the fix for it.
 */
export function attributionDeliveryDone(status: number): boolean {
  if (status === 408 || status === 429) return false;
  if (status >= 200 && status < 300) return true;
  if (status >= 400 && status < 500) return true;
  return false;
}

async function post(
  url: string,
  code: string,
  attributedEvent: AnalyticsEvent
): Promise<boolean> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
  } catch {
    // Network down, DNS, aborted — the retry case, and the whole point of this
    // module. The old code swallowed exactly this and moved on.
    return false;
  }

  if (res.ok) {
    const data = (await res.json().catch(() => null)) as { status?: string } | null;
    if (data?.status === 'attributed') track(attributedEvent);
  }
  return attributionDeliveryDone(res.status);
}

export function registerAttributionSyncHandlers(): void {
  registerHandler('invite.landed', async (payload) => {
    if (!isAttributionPayload(payload)) return true;
    return post('/api/beta/invites/landed', payload.code, 'beta_invite_landed');
  });

  registerHandler('invite.redeem', async (payload) => {
    if (!isAttributionPayload(payload)) return true;
    return post('/api/beta/invites/redeem', payload.code, 'beta_invite_attributed');
  });

  registerHandler('referral.redeem', async (payload) => {
    if (!isAttributionPayload(payload)) return true;
    return post('/api/referral', payload.code, 'referral_attributed');
  });
}

/*
 * Dedupe keys are the codes themselves. Signing in twice enqueues the same key
 * and the outbox collapses it, so a second sign-in cannot produce a second
 * redeem attempt for the same invite — and a genuinely different code still gets
 * its own op.
 */

export function enqueueInviteLanded(code: string): void {
  enqueue('invite.landed', `invite-landed:${code}`, { code });
}

export function enqueueInviteRedeem(code: string): void {
  enqueue('invite.redeem', `invite-redeem:${code}`, { code });
}

export function enqueueReferralRedeem(code: string): void {
  enqueue('referral.redeem', `referral-redeem:${code}`, { code });
}
