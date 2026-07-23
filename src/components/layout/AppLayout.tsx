'use client';
/**
 * Root app shell — nav, sync, journey guard.
 * See: src/components/layout/INDEX.md
 */

import dynamic from 'next/dynamic';
import { MobileNav } from './MobileNav';
import { AppHeader } from './AppHeader';
import { JourneyGuard } from '@/components/journey/JourneyGuard';
import { PageTransition } from '@/components/layout/PageTransition';
import { JourneySyncBoot } from '@/components/layout/JourneySyncBoot';
import { TooltipProvider } from '@/components/ui/tooltip';

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

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <JourneyGuard>
      <TooltipProvider delayDuration={300}>
        <CommissioningCeremony />
        <JourneySyncBoot />
        <div className="flex flex-col h-screen overflow-hidden bg-background">
          <AppHeader />
          <div className="flex flex-1 min-h-0">
            <div className="hidden md:block">
              <Sidebar />
            </div>
            <main className="flex-1 overflow-y-auto pb-[calc(52px+env(safe-area-inset-bottom))] md:pb-0">
              <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl px-4 py-5 md:px-8 md:py-6">
                <PageTransition>{children}</PageTransition>
              </div>
            </main>
          </div>
          <MobileNav />
        </div>
      </TooltipProvider>
    </JourneyGuard>
  );
}
