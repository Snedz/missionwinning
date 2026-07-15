'use client';

import { useJourneySync } from '@/hooks/useJourneySync';

/** Mounted only after idle from JourneySyncBoot. */
export function JourneySyncInner() {
  useJourneySync();
  return null;
}
