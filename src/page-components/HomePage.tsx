'use client';
/**
 * Page: /log — Today hub entry.
 * Lean shell for I-Day/Basic first paint; full dashboard code-split for readiness+.
 * See: JOURNEY.md, ORCHESTRATION.md Horizon 1 perf
 */

import dynamic from 'next/dynamic';
import { useMissionJourney } from '@/hooks/useMissionJourney';
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

export function HomePage() {
  const { state } = useMissionJourney();
  const needsFullDashboard =
    state.phase === 'readiness' || state.phase === 'commissioned';

  if (!needsFullDashboard) {
    return <HomeTodayLean />;
  }

  return <HomeTodayDashboard />;
}
