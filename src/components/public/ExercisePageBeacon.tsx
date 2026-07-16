'use client';

import { useEffect } from 'react';

/** Tiny client beacon — keeps exercise detail pages as RSC shells. */
export function ExercisePageBeacon({ exerciseId }: { exerciseId: string }) {
  useEffect(() => {
    void import('@/lib/analytics').then(({ track }) => {
      track('exercise_page_viewed', { exerciseId });
    });
  }, [exerciseId]);
  return null;
}
