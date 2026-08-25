'use client';

import { useEffect, useState } from 'react';
import {
  getActiveWorkoutFlag,
  readActiveWorkoutPulse,
  subscribeActiveWorkoutFlag,
} from '@/lib/workout/activeWorkoutPulse';

/** Whether an active workout is in progress — for nav pulse and Lean Today Resume. */
export function useActiveWorkoutPulse(): boolean {
  const [on, setOn] = useState(readActiveWorkoutPulse);

  useEffect(() => {
    setOn(readActiveWorkoutPulse());
    return subscribeActiveWorkoutFlag(() => setOn(getActiveWorkoutFlag()));
  }, []);

  return on;
}
