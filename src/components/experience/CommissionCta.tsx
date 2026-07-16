'use client';

import { useCallback, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { XP } from '@/components/experience/experienceStrings';

/** Emerald primary CTA with guarded View Transition flourish. */
export function CommissionCta() {
  const router = useRouter();

  const go = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => { finished: Promise<void> };
      };
      if (typeof doc.startViewTransition !== 'function') return;
      e.preventDefault();
      doc.startViewTransition(() => {
        router.push('/welcome');
      });
    },
    [router]
  );

  return (
    <a href="/welcome" className="primary-action xp-commission-cta" onClick={go}>
      {XP.ch07Cta}
    </a>
  );
}
