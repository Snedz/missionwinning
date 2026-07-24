'use client';

import { useJourneySync } from '@/hooks/useJourneySync';
import { useOutboxDrain } from '@/hooks/useOutboxDrain';

/** Mounted only after idle from JourneySyncBoot. */
export function JourneySyncInner() {
  useJourneySync();
  useOutboxDrain();
  return null;
}
