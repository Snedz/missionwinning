'use client';

import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { JourneyGuard } from "@/components/journey/JourneyGuard";
import { CommissioningCeremony } from "@/components/journey/CommissioningCeremony";
import { MoreNavProvider } from "@/contexts/MoreNavContext";
import { useJourneySync } from "@/hooks/useJourneySync";

export function AppLayout({ children }: { children: React.ReactNode }) {
  useJourneySync();

  return (
    <JourneyGuard>
      <MoreNavProvider>
        <CommissioningCeremony />
        <div className="flex h-screen overflow-hidden">
          <div className="hidden md:flex shrink-0">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-y-auto pb-[calc(52px+env(safe-area-inset-bottom))] md:pb-0">
            <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-3xl px-4 py-6 md:px-8 md:py-8">
              {children}
            </div>
          </main>
          <MobileNav />
        </div>
      </MoreNavProvider>
    </JourneyGuard>
  );
}
