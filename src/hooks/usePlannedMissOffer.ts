'use client';

/**
 * Planned-day miss offer for Today — loadPlan only.
 * Do not call useCoachPlan here: that hook auto-generates a week.
 */

import { useCallback, useEffect, useState } from 'react';
import { useStartCoachSession } from '@/hooks/useStartCoachSession';
import {
  findPlannedMiss,
  type PlannedMissOffer,
} from '@/lib/coach/plannedMiss';
import { currentWeekStart, todayDayOffset } from '@/lib/coach/splitPlanner';
import { loadPlan, savePlannedMissEdit } from '@/lib/coach/storage';
import type { PlanSession } from '@/lib/coach/types';
import type { JourneyPhase } from '@/lib/missionJourney';
import { plannedMissMayMount } from '@/lib/today/todayGuidanceMount';

export function usePlannedMissOffer(phase: JourneyPhase, sessionOpen: boolean) {
  const startCoachSession = useStartCoachSession();
  const [raw, setRaw] = useState<PlannedMissOffer<PlanSession> | null>(null);

  const refresh = useCallback(() => {
    const weekStart = currentWeekStart();
    const next = findPlannedMiss(loadPlan(), todayDayOffset(weekStart), { weekStart });
    setRaw(next.show ? next : null);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('mw-coach-plan-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('mw-coach-plan-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const offer =
    raw &&
    plannedMissMayMount({
      phase,
      show: raw.show,
      sessionOpen,
    })
      ? raw
      : null;

  const doNow = useCallback(() => {
    if (!offer?.session) return;
    startCoachSession(offer.session, { from: 'reentry' });
  }, [offer, startCoachSession]);

  const skip = useCallback(() => {
    if (!offer?.session) return;
    savePlannedMissEdit(currentWeekStart(), offer.session.id, 'skip');
  }, [offer]);

  const slide = useCallback(() => {
    if (!offer?.session) return;
    const weekStart = currentWeekStart();
    savePlannedMissEdit(weekStart, offer.session.id, { slideFrom: todayDayOffset(weekStart) });
  }, [offer]);

  return { offer, doNow, skip, slide };
}
