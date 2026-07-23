/**
 * Client helper — mint private-gate cookie from the current Supabase session.
 * Used after OAuth so proxy.ts can see access (session lives in localStorage).
 */

import { supabase } from '@/lib/supabase';

export async function grantPrivateAccessFromSession(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return false;

    const res = await fetch('/api/private-access/session', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}
