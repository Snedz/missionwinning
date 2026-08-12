/**
 * Client helper — mint private-gate cookie from the current Supabase session.
 * OAuth callback route also mints this server-side; this covers gate-page recovery.
 *
 * Fail-open: bounded timeout, no redirect unless the gate cookie is probe-confirmed.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { confirmPrivateGateCookie } from '@/lib/confirmPrivateGateCookie';

/** Upper bound for cold / invitee session recovery — then show the access-code form. */
export const SESSION_UNLOCK_TIMEOUT_MS = 6_000;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      }
    );
  });
}

async function grantPrivateAccessFromSessionInner(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!isSupabaseConfigured()) return false;

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return false;

  const res = await fetch('/api/private-access/session', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(SESSION_UNLOCK_TIMEOUT_MS),
  });
  if (!res.ok) return false;

  return confirmPrivateGateCookie();
}

export async function grantPrivateAccessFromSession(): Promise<boolean> {
  try {
    return await withTimeout(
      grantPrivateAccessFromSessionInner(),
      SESSION_UNLOCK_TIMEOUT_MS,
      false
    );
  } catch {
    return false;
  }
}

/** Hard navigation so proxy re-evaluates the gate cookie (soft router.replace can show marketing home). */
export function navigateAfterPrivateGateUnlock(dest: string): void {
  if (typeof window === 'undefined') return;
  window.location.assign(dest);
}
