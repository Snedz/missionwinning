import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { routeMetadata } from '@/lib/routeMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';

const LeaderboardPage = dynamic(
  () => import('@/page-components/LeaderboardPage').then((m) => m.LeaderboardPage),
  { loading: () => <RouteLoading label="Leaderboard" /> }
);

export const metadata: Metadata = routeMetadata('leaderboard');

export default function LeaderboardRoute() {
  return (
    <Suspense fallback={<RouteLoading label="Leaderboard" />}>
      <LeaderboardPage />
    </Suspense>
  );
}
