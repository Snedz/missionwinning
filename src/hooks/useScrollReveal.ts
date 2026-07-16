'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

export type UseScrollRevealOptions = {
  /** IntersectionObserver threshold (0–1). Default 0.2 */
  threshold?: number;
  /** rootMargin string. Default `0px 0px -8% 0px` */
  rootMargin?: string;
  /** When true, unobserve after first visible (default true). */
  once?: boolean;
};

/**
 * IntersectionObserver helper for marketing scroll-reveal.
 * Generalizes the pattern used by JourneyScroll — pair with `.reveal` / `.reveal-visible`.
 * Respects prefers-reduced-motion by reporting visible immediately.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): { ref: RefObject<T | null>; visible: boolean } {
  const { threshold = 0.2, rootMargin = '0px 0px -8% 0px', once = true } = options;
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, visible };
}
