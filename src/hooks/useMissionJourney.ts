'use client';

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
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  return {
    state,
    action,
    refresh,
    isCommissioned: state.phase === 'commissioned',
    showFullToday: state.phase === 'commissioned' || state.phase === 'readiness',
  };
}
