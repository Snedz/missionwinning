'use client';

/**
 * The docked field a screen holds above the tab bar — Today's next action, the
 * logger's console, a pillar's Start.
 *
 * It portals into a host that `AppLayout` renders as a flex sibling of `main`,
 * for two reasons:
 *
 * 1. `position: fixed` does not work from inside a screen. `.stagger-enter`
 *    animates `transform: translateY()` with `both`, so the final frame leaves
 *    a transform applied — and a transformed ancestor becomes the containing
 *    block for fixed descendants. A "fixed" dock inside a `StaggerItem` would
 *    pin itself to that item.
 * 2. A flex sibling reserves its own height. `main` is `flex-1 min-h-0`, so it
 *    shrinks by exactly what the dock takes and nothing overlaps the content —
 *    which is the bug `RestTimerBar` has today, floating over the very set row
 *    it describes because only the tab bar was ever padded for.
 *
 * **Compact only.** Docking is a decision from the mobile handoff; the desktop
 * app puts its action inline in the content flow, where handoff 2 drew it. At
 * `md+` this renders `children` in place and never touches the host.
 *
 * The branch is on `useIsCompact()`, not on `hidden`/`md:block`. Rendering both
 * and hiding one would put two copies in the tree, and `first-90` counts
 * `.primary-action` without caring which is visible.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useIsCompact } from '@/hooks/useIsCompact';

export const SCREEN_DOCK_HOST_ID = 'screen-dock';

/** Flex host for the analytics consent banner — between this dock and MobileNav. */
export const CONSENT_BANNER_HOST_ID = 'consent-banner';

export function ScreenDock({ children }: { children: ReactNode }) {
  const isCompact = useIsCompact();
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHost(document.getElementById(SCREEN_DOCK_HOST_ID));
  }, []);

  // Desktop: in the flow, exactly where the caller placed it.
  if (!isCompact) return <>{children}</>;

  if (!host) return null;

  return createPortal(
    /* Same measure as `main`'s inner container, so the dock's edges line up
       with the content it belongs to instead of running the full window. */
    <div className="mx-auto w-full max-w-lg px-4">{children}</div>,
    host
  );
}
