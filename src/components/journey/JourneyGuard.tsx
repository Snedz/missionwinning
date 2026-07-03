'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isIDayComplete } from '@/lib/missionJourney';
import { isJourneyBypassPath } from '@/lib/publicRoutes';

/** Sends new members to I-Day before using the app shell. */
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
