'use client';
/**
 * Root app shell — nav, sync, journey guard.
 * See: src/components/layout/INDEX.md
 */

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MobileNav } from './MobileNav';
import { AppHeader } from './AppHeader';
import { CONSENT_BANNER_HOST_ID, SCREEN_DOCK_HOST_ID } from './ScreenDock';
import { JourneyGuard } from '@/components/journey/JourneyGuard';
import { PageTransition } from '@/components/layout/PageTransition';
import { JourneySyncBoot } from '@/components/layout/JourneySyncBoot';
import { TooltipProvider } from '@/components/ui/tooltip';
import { recordScreen } from '@/lib/screenTrail';
import { useVisualViewportKeyboardOverlap } from '@/hooks/useVisualViewportKeyboardOverlap';
import '@/styles/patreonTokens.css';

const Sidebar = dynamic(() => import('./Sidebar').then((m) => ({ default: m.Sidebar })), {
  ssr: false,
});

const CommissioningCeremony = dynamic(
  () =>
    import('@/components/journey/CommissioningCeremony').then((m) => ({
      default: m.CommissioningCeremony,
    })),
  { ssr: false }
);

/** Pulls navConfig's extended icon set only when the fifth tab is first pressed. */
const MoreSheet = dynamic(() => import('./MoreSheet').then((m) => ({ default: m.MoreSheet })), {
  ssr: false,
});

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  /**
   * The only new state in the mobile redesign. It lives here because both the
   * tab bar and the header brand button open the same sheet, and two owners of
   * one overlay is how you end up able to open it twice.
   */
  const [moreOpen, setMoreOpen] = useState(false);
  const openMore = useCallback(() => setMoreOpen(true), []);
  const closeMore = useCallback(() => setMoreOpen(false), []);
  const keyboardOverlap = useVisualViewportKeyboardOverlap();

  useEffect(() => {
    setMoreOpen(false);
    // `.215` — a breadcrumb for the feedback sheet, which lives on Profile and
    // would otherwise only ever be able to say "this happened on /profile".
    recordScreen(pathname);
  }, [pathname]);

  return (
    <JourneyGuard>
      <TooltipProvider delayDuration={300}>
        <CommissioningCeremony />
        <JourneySyncBoot />
        <div
          className="ptn flex flex-col h-screen overflow-hidden bg-background"
          style={keyboardOverlap > 0 ? { paddingBottom: keyboardOverlap } : undefined}
        >
          <AppHeader onOpenMore={openMore} moreOpen={moreOpen} />
          <div className="flex flex-1 min-h-0">
            <div className="hidden md:block">
              <Sidebar />
            </div>
            {/* No bottom padding for the tab bar any more — the bar and the
                dock are flex siblings that reserve their own height. */}
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-lg px-4 py-5 md:ptn-desktop-main md:px-8 md:py-6">
                <PageTransition>{children}</PageTransition>
              </div>
            </main>
          </div>
          {/* Screens portal their docked field here — see ScreenDock. A flex
              sibling of `main`, so `main` shrinks by the dock's height instead
              of something fixed covering the content it belongs to. */}
          <div id={SCREEN_DOCK_HOST_ID} className="shrink-0 empty:hidden" />
          {/* Consent docks here — a flex sibling above the tab bar, never a
              fixed overlay on Today's Start (Preview walk P0-1 / `.765`). */}
          <div id={CONSENT_BANNER_HOST_ID} className="shrink-0 empty:hidden" />
          <MobileNav onOpenMore={openMore} moreOpen={moreOpen} />
          <MoreSheet open={moreOpen} onClose={closeMore} />
        </div>
      </TooltipProvider>
    </JourneyGuard>
  );
}
