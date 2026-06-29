'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/** Subtle route content fade — Bevel-style page enter on navigation. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={cn('page-enter min-h-0')}>
      {children}
    </div>
  );
}
