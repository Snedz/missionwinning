/**
 * `week_logged` through the durable outbox — guests and accounts both.
 *
 * The payload carries a device id on every write. When a session cookie resolves the
 * server ignores it for ownership and keys the row to the account; when none resolves it
 * is the only owner, and the server then requires that the device already holds a push
 * subscription. Sending it unconditionally means the client never has to know — or be
 * able to assert — whether consent exists.
 *
 * The handler is a no-op on a missing device rather than a retry loop, and a 4xx is
 * terminal: a guest without consent is a settled answer, not a transient failure.
 */

import { enqueue, registerHandler } from '@/lib/sync/outbox';

export type WeekLoggedPayload = {
  isoWeek: string;
  deviceId: string;
};

const ISO_WEEK_RE = /^\d{4}-W\d{2}$/;

/** Matches the server's `isPlausibleDeviceId`: client-generated UUIDs, bounded length. */
const DEVICE_ID_RE = /^[\w-]{1,64}$/;

export function isWeekLoggedPayload(p: unknown): p is WeekLoggedPayload {
  if (!p || typeof p !== 'object') return false;
  const { isoWeek, deviceId } = p as Partial<WeekLoggedPayload>;
  return (
    typeof isoWeek === 'string' &&
    ISO_WEEK_RE.test(isoWeek) &&
    typeof deviceId === 'string' &&
    DEVICE_ID_RE.test(deviceId)
  );
}

/**
 * 4xx (except 408/429) is done — a refused guest write must not retry into a loop.
 * 5xx / network throw retries.
 */
export function weekLoggedDeliveryDone(status: number): boolean {
  if (status === 408 || status === 429) return false;
  if (status >= 200 && status < 300) return true;
  if (status >= 400 && status < 500) return true;
  return false;
}

async function postWeekLogged(isoWeek: string, deviceId: string): Promise<boolean> {
  let res: Response;
  try {
    res = await fetch('/api/metrics/week-logged', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isoWeek, deviceId }),
    });
  } catch {
    return false;
  }
  return weekLoggedDeliveryDone(res.status);
}

export function registerWeekLoggedSyncHandler(): void {
  registerHandler('week.logged', async (payload) => {
    if (!isWeekLoggedPayload(payload)) return true;
    return postWeekLogged(payload.isoWeek, payload.deviceId);
  });
}

/** Queue one ISO week for this install. Returns immediately. */
export function enqueueWeekLogged(isoWeek: string, deviceId: string): void {
  if (!ISO_WEEK_RE.test(isoWeek)) return;
  if (!DEVICE_ID_RE.test(deviceId)) return;
  enqueue('week.logged', `week:${isoWeek}`, { isoWeek, deviceId });
}
