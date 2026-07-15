'use client';

import { useEffect, useState } from 'react';
import {
  getActiveWorkoutFlag,
  hydrateActiveWorkoutFlagFromStorage,
  subscribeActiveWorkoutFlag,
} from '@/lib/activeWorkoutPulse';

/** Whether an active workout is in progress — for nav pulse only. */
export function useActiveWorkoutPulse(): boolean {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(hydrateActiveWorkoutFlagFromStorage());
    return subscribeActiveWorkoutFlag(() => setOn(getActiveWorkoutFlag()));
  }, []);

  return on;
}
