'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useScrollReveal, type UseScrollRevealOptions } from '@/hooks/useScrollReveal';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Extra delay (ms) applied as transitionDelay when visible. */
  delayMs?: number;
} & UseScrollRevealOptions;

/**
 * Marketing scroll-reveal wrapper — adds `.reveal` / `.reveal-visible`.
 * Reduced-motion users get content immediately via useScrollReveal.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
  threshold,
  rootMargin,
  once,
}: RevealProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold, rootMargin, once });

  return (
    <div
      ref={ref}
      className={cn('reveal', visible && 'reveal-visible', className)}
      style={delayMs ? { transitionDelay: visible ? `${delayMs}ms` : undefined } : undefined}
    >
      {children}
    </div>
  );
}
