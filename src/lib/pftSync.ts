import { getUser } from '@/lib/supabase';
import type { FitnessTestSession } from '@/lib/presidentialFitnessTest';
import { enqueue, registerHandler } from '@/lib/sync/outbox';

/**
 * Queue a test result. Keyed per session, not latest-state: two results are two
 * records, so they must not collapse into one another. `delayMs` accepted for
 * call-site compatibility and ignored — the outbox owns timing.
 *
 * Inactive while the `america` surface is parked (nothing calls this), but wired so
 * the declared outbox kind is honest and unparking needs no further work.
 */
export function schedulePftPush(session: FitnessTestSession, _delayMs = 1500): void {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  enqueue('pft.push', session.completedAt || 'pft', session);
}

let registered = false;

/** Idempotent. Called from useOutboxDrain. */
export function registerPftSyncHandler(): void {
  if (registered) return;
  registered = true;
  registerHandler('pft.push', async (payload) => {
    const session = payload as FitnessTestSession | null;
    if (!session?.completedAt) return true; // malformed: drop rather than retry forever
    return pushPftResult(session);
  });
}

/**
 * 4xx (except 408/429) is done — a signed-out or invalid payload must not retry.
 * 5xx / network throw retries.
 */
export function pftResultDeliveryDone(status: number): boolean {
  if (status === 408 || status === 429) return false;
  if (status >= 200 && status < 300) return true;
  if (status >= 400 && status < 500) return true;
  return false;
}

/** Resolves true when the result is stored (or intentionally skipped). */
export async function pushPftResult(session: FitnessTestSession): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return true;
  const user = await getUser();
  if (!user) return true; // signed out — not a failure

  let res: Response;
  try {
    res = await fetch('/api/pft/results', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: session.id,
        completedAt: session.completedAt,
        age: session.age,
        sex: session.sex,
        mode: session.mode,
        events: session.events.map((e) => ({ eventId: e.eventId, value: e.value })),
      }),
    });
  } catch {
    return false;
  }
  return pftResultDeliveryDone(res.status);
}
