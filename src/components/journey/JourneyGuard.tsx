'use client';
/**
 * Redirects incomplete I-Day users to Welcome — except tracker paths.
 * I-Day is a Skip, not a wall. See: src/components/journey/INDEX.md
 */

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isIDayComplete } from '@/lib/missionJourney';
import { isJourneyBypassPath } from '@/lib/publicRoutes';

/** Sends new members to I-Day before leftover rooms. Tracker stays open. */
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
