/**
 * Open Train session → `profiles.open_session`, over the outbox (`.958`).
 *
 * Latest-state: one dedupe key. Handler writes the **enqueued** snapshot
 * (live or tombstone). It does not re-read the store the way `coach.plan`
 * does: Finish clears `activeWorkout`, so a re-read would upsert `null`
 * and the other surface would treat empty remote as `push-local` and
 * reopen a closed session. Tombstone keeps `clientId`. Signed out /
 * missing column / no cloud is ACK — do not spin backoff. No Force Sync.
 */
import { supabase, getUser } from '@/lib/supabase';
import { enqueue, registerHandler } from '@/lib/sync/outbox';
import {
  parseOpenSession,
  type OpenSessionSnapshot,
} from '@/lib/workout/openSessionContinuity';

export function enqueueOpenSession(snapshot: OpenSessionSnapshot | null): void {
  enqueue('workout.active', 'active', snapshot);
}

function isMissingOpenSessionColumn(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase();
  return msg.includes('open_session') || error.code === '42703' || error.code === 'PGRST204';
}

export async function pullOpenSession(): Promise<OpenSessionSnapshot | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('open_session')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    if (isMissingOpenSessionColumn(error)) return null;
    console.error('pullOpenSession error', error);
    return null;
  }
  return parseOpenSession(data?.open_session);
}

export async function pushOpenSession(payload: unknown): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return true;
  const user = await getUser();
  if (!user) return true;

  const snapshot = payload === null ? null : parseOpenSession(payload);
  if (payload !== null && payload !== undefined && !snapshot) return true;

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      open_session: snapshot,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    if (isMissingOpenSessionColumn(error)) return true;
    console.error('pushOpenSession error', error);
    return false;
  }
  return true;
}

let registered = false;

/** Idempotent — safe to call from useOutboxDrain. */
export function registerOpenSessionSyncHandler(): void {
  if (registered) return;
  registered = true;
  registerHandler('workout.active', pushOpenSession);
}
