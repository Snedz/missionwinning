'use client';
/**
 * Page: /log — Today hub entry.
 * Lean shell for I-Day/Basic first paint; full dashboard code-split for readiness+.
 * Phase gate reads device storage only — no workoutStore on cold path for basic users.
 * See: docs/JOURNEY.md, ORCHESTRATION.md Horizon 1 perf
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { JourneyPhase } from '@/lib/missionJourney';
import { HomeTodayLean } from '@/page-components/HomeTodayLean';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson } from '@/lib/storage/safeStorage';

/** Phone cap at default; md+ defers to AppLayout — same as HomeTodayLean / HomeTodayDashboard today-shell. */
function TodayDashboardLoading() {
  return (
    <div
      className="today-shell space-y-4 p-4 max-w-lg md:max-w-none mx-auto"
      role="status"
      aria-busy="true"
      aria-label="Loading Today"
    >
      <SkeletonCard />
      <SkeletonCard className="h-28" />
      <SkeletonCard />
    </div>
  );
}

const HomeTodayDashboard = dynamic(
  () =>
    import('@/page-components/HomeTodayDashboard').then((m) => ({
      default: m.HomeTodayDashboard,
    })),
  {
    ssr: false,
    loading: () => <TodayDashboardLoading />,
  }
);

export function HomePage() {
  const [phase, setPhase] = useState<JourneyPhase | null>(null);

  useEffect(() => {
    const parsed = readJson<{ phase?: JourneyPhase } | null>(STORAGE_KEYS.journeyState, null);
    setPhase(parsed?.phase ?? 'basic');
  }, []);

  if (phase == null) {
    return <TodayDashboardLoading />;
  }

  const needsFullDashboard = phase === 'readiness' || phase === 'commissioned';
  if (!needsFullDashboard) {
    return <HomeTodayLean />;
  }

  return <HomeTodayDashboard />;
}
