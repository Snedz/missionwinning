'use client';
/**
 * Page: /log — Today hub entry.
 * Lean shell for I-Day/Basic first paint; full dashboard code-split for readiness+.
 * Phase gate reads localStorage only — no workoutStore on cold path for basic users.
 * See: docs/JOURNEY.md, ORCHESTRATION.md Horizon 1 perf
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { JourneyPhase } from '@/lib/missionJourney';
import { HomeTodayLean } from '@/page-components/HomeTodayLean';
import { SkeletonCard } from '@/components/ui/Skeleton';

function TodayDashboardLoading() {
  return (
    <div
      className="space-y-4 p-4 max-w-lg mx-auto"
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
    try {
      const raw = localStorage.getItem('mw_journey_state');
      if (raw) {
        const parsed = JSON.parse(raw) as { phase?: JourneyPhase };
        if (parsed.phase) {
          setPhase(parsed.phase);
          return;
        }
      }
    } catch {
      /* fall through */
    }
    setPhase('basic');
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
