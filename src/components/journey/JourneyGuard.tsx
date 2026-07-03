'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isIDayComplete } from '@/lib/missionJourney';

const BYPASS = ['/welcome', '/private', '/vision', '/about', '/terms', '/privacy', '/beta', '/america', '/feedback'];

/** Sends new members to I-Day before using the app shell. */
export function JourneyGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (BYPASS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return;
    if (!isIDayComplete()) {
      router.replace('/welcome');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
