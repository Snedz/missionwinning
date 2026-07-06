'use client';
/**
 * Journey phase and I-Day completion state.
 * Consumers: journey components, JourneyGuard | See: JOURNEY.md
 */

import { useCallback, useEffect, useState } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import {
  getNextAction,
  loadJourneyState,
  syncJourneyPhase,
  type JourneyAction,
  type JourneyState,
} from '@/lib/missionJourney';

export function useMissionJourney() {
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const [state, setState] = useState<JourneyState>(() => loadJourneyState());
  const [action, setAction] = useState<JourneyAction>(() => getNextAction([]));

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
