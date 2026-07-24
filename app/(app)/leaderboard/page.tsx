import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { routeMetadata } from '@/lib/routeMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';
import { surfaceMetadata } from '@/lib/surfaceRoute';

const LeaderboardPage = dynamic(
  () => import('@/page-components/LeaderboardPage').then((m) => m.LeaderboardPage),
  { loading: () => <RouteLoading label="Leaderboard" /> }
);

export const metadata: Metadata = surfaceMetadata('leaderboard', routeMetadata('leaderboard'));

export default function LeaderboardRoute() {
  return (
    <Suspense fallback={<RouteLoading label="Leaderboard" />}>
      <LeaderboardPage />
    </Suspense>
  );
}
