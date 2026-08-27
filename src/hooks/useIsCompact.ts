'use client';

/**
 * Is this the mobile surface?
 *
 * The app has **two designs, not one responsive design**: the desktop app
 * (handoff 2, `.139`–`.149`) and the mobile app (handoff 3, `.150`–`.158`).
 * Each is responsive within its own band; this is the line between them.
 *
 * 767px is not a new number — it is the underside of Tailwind's `md`, already
 * the boundary the shell uses: the room rail is persistent; `MobileNav` is
 * `md:hidden`. One line, so the two designs cannot overlap or leave a gap.
 *
 * **Use this to choose a branch, never to render both and hide one.** Two
 * copies in the DOM is how `first-90`'s `.primary-action` count breaks — it
 * counts hidden nodes too.
 */

import { useEffect, useState } from 'react';

/** Tailwind `md` is 768px, so compact is everything under it. */
export const COMPACT_QUERY = '(max-width: 767px)';

export function useIsCompact(): boolean {
  // Compact by default on first paint: the product is mobile-first and the
  // hero e2e runs at 390px, so a desktop flash of the mobile layout is the
  // cheaper wrong guess.
  const [isCompact, setIsCompact] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(COMPACT_QUERY);
    const sync = () => setIsCompact(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return isCompact;
}
