'use client';

import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { AppHeader } from './AppHeader';
import { JourneyGuard } from '@/components/journey/JourneyGuard';
import { CommissioningCeremony } from '@/components/journey/CommissioningCeremony';
import { useJourneySync } from '@/hooks/useJourneySync';

export function AppLayout({ children }: { children: React.ReactNode }) {
  useJourneySync();

  return (
    <JourneyGuard>
      <CommissioningCeremony />
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <AppHeader />
        <div className="flex flex-1 min-h-0">
          <Sidebar />
          <main className="flex-1 overflow-y-auto pb-[calc(52px+env(safe-area-inset-bottom))] md:pb-0">
            <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-3xl px-4 py-5 md:px-8 md:py-6">
              {children}
            </div>
          </main>
        </div>
        <MobileNav />
      </div>
    </JourneyGuard>
  );
}
