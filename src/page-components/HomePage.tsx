'use client';
/**
 * Page: /log — Today hub entry.
 * Lean shell for I-Day/Basic first paint; full dashboard code-split for readiness+.
 * Phase gate reads localStorage only — no workoutStore on cold path for basic users.
 * See: JOURNEY.md, ORCHESTRATION.md Horizon 1 perf
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { JourneyPhase } from '@/lib/missionJourney';
import { HomeTodayLean } from '@/page-components/HomeTodayLean';

const HomeTodayDashboard = dynamic(
  () =>
    import('@/page-components/HomeTodayDashboard').then((m) => ({
      default: m.HomeTodayDashboard,
    })),
  {
    ssr: false,
    loading: () => <HomeTodayLean />,
  }
);

/** Journey phase without pulling workoutStore / full mission hook. */
function useJourneyPhaseLite(): JourneyPhase {
  const [phase, setPhase] = useState<JourneyPhase>('basic');
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mw_journey_state');
      if (raw) {
        const parsed = JSON.parse(raw) as { phase?: JourneyPhase };
        if (parsed.phase) setPhase(parsed.phase);
      }
    } catch {
      /* keep basic */
    }
  }, []);
  return phase;
}

export function HomePage() {
  const phase = useJourneyPhaseLite();
  const needsFullDashboard = phase === 'readiness' || phase === 'commissioned';

  if (!needsFullDashboard) {
    return <HomeTodayLean />;
  }

  return <HomeTodayDashboard />;
}
