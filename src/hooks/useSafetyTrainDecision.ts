'use client';

import { useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CLEAR_SAFETY_TRAIN,
  loadSafetyTrainDecision,
  presentTrainCta,
  type SafetyTrainDecision,
  type TrainCta,
} from '@/lib/safetyTrainGuidance';

/**
 * First paint matches SSR (clear). The flag is read in layout, before paint.
 */
export function useSafetyTrainDecision(sessionName?: string | null): SafetyTrainDecision {
  const [decision, setDecision] = useState<SafetyTrainDecision>(CLEAR_SAFETY_TRAIN);
  useLayoutEffect(() => {
    setDecision(loadSafetyTrainDecision(sessionName));
  }, [sessionName]);
  return decision;
}

export function useTrainCta(
  fallback: { labelKey: string; defaultLabel: string },
  sessionName?: string | null,
  opts?: { logger?: boolean }
): { decision: SafetyTrainDecision; cta: TrainCta } {
  const decision = useSafetyTrainDecision(sessionName);
  return { decision, cta: presentTrainCta(decision, fallback, opts) };
}

/** Resume of an open workout still runs. A withhold recommendation goes to Move. */
export function useSafePrimaryClick(onPrimaryClick: () => void, active: boolean) {
  const decision = useSafetyTrainDecision();
  const router = useRouter();
  const onClick = () => {
    if (active) {
      onPrimaryClick();
      return;
    }
    const cta = presentTrainCta(decision, { labelKey: 'justGoCta', defaultLabel: 'Just Go' });
    if (!cta.startsWorkout) {
      router.push(cta.href ?? '/move');
      return;
    }
    onPrimaryClick();
  };
  return { decision, onClick };
}
