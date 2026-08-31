'use client';
/**
 * Redirects incomplete I-Day users to Welcome — except Today and Train.
 * I-Day is a Skip, not a wall (`.1060`). See: src/components/journey/INDEX.md
 */

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isIDayComplete } from '@/lib/missionJourney';
import { isJourneyBypassPath } from '@/lib/publicRoutes';

/** Sends new members to I-Day before Coach / History / You. Tracker stays open. */
export function JourneyGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isJourneyBypassPath(pathname)) return;
    if (!isIDayComplete()) {
      router.replace('/welcome');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
