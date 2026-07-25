import { supabase, getUser } from '@/lib/supabase';
import type { FitnessTestSession } from '@/lib/presidentialFitnessTest';
import { getJoinedClassCode } from '@/lib/schoolClass';
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

/** Resolves true when the result is stored (or intentionally skipped). */
export async function pushPftResult(session: FitnessTestSession): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return true;
  const user = await getUser();
  if (!user) return true; // signed out — not a failure

  const classCode = getJoinedClassCode();

  const { error } = await supabase.from('fitness_test_results').insert({
    user_id: user.id,
    class_code: classCode,
    session,
    overall_tier: session.overallTier,
    age: session.age,
    completed_at: session.completedAt,
  });

  if (error) {
    console.warn('pft sync', error.message);
    return false; // let the outbox retry
  }
  return true;
}
