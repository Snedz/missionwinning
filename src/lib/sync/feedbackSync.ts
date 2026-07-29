/**
 * Feedback through the outbox — the third instance of the `.170` bug, fixed the
 * way `.170` said it needed: "that one needs an outbox retry, not a polish fix."
 *
 * `FeedbackPage` called `submitLead` and discarded the `{ ok }` result, then showed
 * "Thank you" unconditionally. The local copy survived (device storage writes first),
 * but the note itself silently never left a phone with no signal — and these notes
 * are the "why I almost quit" interview record the beta exists to collect. A thank-you
 * screen over a dropped submission is the app lying about the one thing the page does.
 *
 * Each entry keys on its own id: feedback is per-entity like a workout, not
 * latest-state like a coach plan — two notes a week apart must both arrive.
 */

import { enqueue, registerHandler } from '@/lib/sync/outbox';
import { submitLead } from '@/lib/supabase';

export interface FeedbackPayload {
  name: string;
  email: string;
  goals: string;
  package_interest: string;
  source: string;
  message: string;
}

function isFeedbackPayload(p: unknown): p is FeedbackPayload {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  return typeof o.email === 'string' && typeof o.goals === 'string';
}

/**
 * Map a `submitLead` result onto the outbox contract (true = done, false = retry).
 *
 * `ok: false` is an HTTP failure or a thrown fetch — the retry cases. `localOnly` is
 * NOT a retry case: it covers the demo env (no Supabase configured, where a retry can
 * never improve and would strand every op stuck) and a 202 (accepted). Exported pure
 * because the handler around it cannot be tested without mocking the network module —
 * which is exactly how the original fire-and-forget bug stayed invisible.
 */
export function feedbackDeliveryDone(result: { ok: boolean; localOnly?: boolean }): boolean {
  return result.ok;
}

export function registerFeedbackSyncHandler(): void {
  registerHandler('feedback.submit', async (payload) => {
    // A payload that cannot be read will never succeed; reporting success drops it
    // deliberately rather than retrying garbage for MAX_ATTEMPTS and going stuck.
    if (!isFeedbackPayload(payload)) return true;
    return feedbackDeliveryDone(await submitLead(payload));
  });
}

/** Queue one feedback entry. Returns immediately; the outbox owns delivery. */
export function enqueueFeedback(entry: FeedbackPayload, id: string): void {
  enqueue('feedback.submit', `feedback:${id}`, entry);
}
