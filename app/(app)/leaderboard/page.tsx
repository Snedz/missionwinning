import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LeaderboardPage } from '@/page-components/LeaderboardPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('leaderboard');

export default function LeaderboardRoute() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] animate-pulse rounded-2xl bg-muted/20" />}>
      <LeaderboardPage />
    </Suspense>
  );
}
