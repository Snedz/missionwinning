/**
 * Signed-in `week_logged` through the durable outbox.
 *
 * Guests never call `enqueueWeekLogged`. The handler is a no-op on a missing
 * session so a later sign-out cannot spin retries.
 */

import { enqueue, registerHandler } from '@/lib/sync/outbox';

export type WeekLoggedPayload = {
  isoWeek: string;
};

const ISO_WEEK_RE = /^\d{4}-W\d{2}$/;

export function isWeekLoggedPayload(p: unknown): p is WeekLoggedPayload {
  return (
    !!p &&
    typeof p === 'object' &&
    typeof (p as { isoWeek?: unknown }).isoWeek === 'string' &&
    ISO_WEEK_RE.test((p as WeekLoggedPayload).isoWeek)
  );
}

/**
 * 4xx (except 408/429) is done — an unauthorized guest write must not retry.
 * 5xx / network throw retries.
 */
export function weekLoggedDeliveryDone(status: number): boolean {
  if (status === 408 || status === 429) return false;
  if (status >= 200 && status < 300) return true;
  if (status >= 400 && status < 500) return true;
  return false;
}

async function postWeekLogged(isoWeek: string): Promise<boolean> {
  let res: Response;
  try {
    res = await fetch('/api/metrics/week-logged', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isoWeek }),
    });
  } catch {
    return false;
  }
  return weekLoggedDeliveryDone(res.status);
}

export function registerWeekLoggedSyncHandler(): void {
  registerHandler('week.logged', async (payload) => {
    if (!isWeekLoggedPayload(payload)) return true;
    return postWeekLogged(payload.isoWeek);
  });
}

/** Queue one ISO week for a signed-in account. Returns immediately. */
export function enqueueWeekLogged(isoWeek: string): void {
  if (!ISO_WEEK_RE.test(isoWeek)) return;
  enqueue('week.logged', `week:${isoWeek}`, { isoWeek });
}
