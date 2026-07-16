'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Subtle route content fade on client navigations only.
 * First paint skips animation so Lighthouse / cold load isn't taxed.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mounted = useRef(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div key={pathname} className={cn('min-h-0', animate && 'page-enter')}>
      {children}
    </div>
  );
}
