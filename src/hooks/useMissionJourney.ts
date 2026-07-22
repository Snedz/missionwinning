'use client';
/**
 * Journey phase and I-Day completion state.
 * Consumers: journey components, JourneyGuard | See: docs/JOURNEY.md
 */

import { useCallback, useEffect, useState } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import {
  getDefaultJourneyState,
  getNextAction,
  syncJourneyPhase,
  type JourneyAction,
  type JourneyState,
} from '@/lib/missionJourney';

const SSR_ACTION: JourneyAction = {
  label: 'Begin I-Day',
  description: 'Where the journey begins — in-processing takes about 2 minutes.',
  href: '/welcome',
  phase: 'i-day',
  stepLabel: 'I-Day · Where you start',
  progressPct: 0,
};

export function useMissionJourney() {
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  /** Stable SSR defaults — localStorage journey phase only applied after mount. */
  const [state, setState] = useState<JourneyState>(() => getDefaultJourneyState());
  const [action, setAction] = useState<JourneyAction>(() => SSR_ACTION);

  const refresh = useCallback(() => {
    const next = syncJourneyPhase(workoutHistory);
    setState(next);
    setAction(getNextAction(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('mw_')) refresh();
    };
    const onJourneyEvent = () => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('mw-journey-event', onJourneyEvent);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('mw-journey-event', onJourneyEvent);
    };
  }, [refresh]);

  return {
    state,
    action,
    refresh,
    isCommissioned: state.phase === 'commissioned',
    showFullToday: state.phase === 'commissioned' || state.phase === 'readiness',
  };
}
