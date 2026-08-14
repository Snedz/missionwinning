'use client';
/**
 * Push/pull journey progress to Supabase when signed in.
 * Consumers: AppLayout | See: src/lib/journeySync.ts
 */

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { pullJourneyFromCloud, scheduleJourneyPush, syncJourneyOnSignIn } from '@/lib/journeySync';
import { clearAthleteLocalState } from '@/lib/storage/athleteLocalState';
import { restorePremiumCourseProgressForUser } from '@/lib/learnCourseProgress';
import { setLoggerAuthPresence } from '@/lib/authPresence';

/** Keeps journey state in sync with Supabase profiles when signed in. */
export function useJourneySync() {
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setLoggerAuthPresence(!!session?.user);
      if (event === 'SIGNED_IN' && session?.user) {
        void syncJourneyOnSignIn();
        /*
         * `.203` — the other half of a mirror that was only ever written.
         *
         * `markPremiumSectionComplete` has been writing a per-user copy of
         * course progress on every completion, and
         * `restorePremiumCourseProgressForUser` — its only reader — had **zero
         * callers anywhere**. Sign-in is when a restore is meaningful, and it is
         * where the parallel fuel mirror is already read from
         * (`useFuelPlan.ts:64`). The learn path was the one left half-connected.
         */
        restorePremiumCourseProgressForUser(session.user.id);
      }
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        void pullJourneyFromCloud();
      }
      if (event === 'SIGNED_OUT') {
        setLoggerAuthPresence(false);
        clearAthleteLocalState();
      }
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      setLoggerAuthPresence(!!data.session?.user);
      if (data.session?.user) {
        await pullJourneyFromCloud();
      }
    })();

    const onLocalChange = (e: StorageEvent) => {
      if (e.key?.startsWith('mw_') || e.key === 'i18nextLng') scheduleJourneyPush();
    };
    const onJourneySaved = () => scheduleJourneyPush();
    const onLocalJourneyChange = () => scheduleJourneyPush();
    const onUiModeChange = () => scheduleJourneyPush();

    window.addEventListener('storage', onLocalChange);
    window.addEventListener('mw-journey-synced', onJourneySaved);
    window.addEventListener('mw-journey-local-change', onLocalJourneyChange);
    window.addEventListener('mw-ui-mode', onUiModeChange);

    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener('storage', onLocalChange);
      window.removeEventListener('mw-journey-synced', onJourneySaved);
      window.removeEventListener('mw-journey-local-change', onLocalJourneyChange);
      window.removeEventListener('mw-ui-mode', onUiModeChange);
    };
  }, []);
}
