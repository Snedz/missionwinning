'use client';
/**
 * Signed-in Mission ID from the server. Guests stay null — no client mint.
 */
import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export function useMissionId(): number | null {
  const [missionId, setMissionId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured()) return;
      const { data } = await supabase.auth.getUser();
      if (!data.user?.id) return;
      const res = await fetch('/api/account/mission-id');
      if (!res.ok) return;
      const body = (await res.json().catch(() => null)) as { missionId?: unknown } | null;
      const n = body?.missionId;
      if (
        !cancelled &&
        typeof n === 'number' &&
        Number.isInteger(n) &&
        n >= 1
      ) {
        setMissionId(n);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return missionId;
}
