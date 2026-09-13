import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';
import { surfaceMetadata } from '@/lib/surfaceRoute';
import { LeaderboardPage } from '@/page-components/LeaderboardPage';

export const metadata: Metadata = surfaceMetadata('leaderboard', routeMetadata('leaderboard'));

type SearchParams = Promise<{
  board?: string | string[];
  scope?: string | string[];
  class?: string | string[];
}>;

function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * Leaderboard first paint is house leftover. `useSearchParams()` plus
 * `dynamic()` + `RouteLoading` made the served HTML a skeleton
 * ("Loading Leaderboard…"). `?board=` / `?scope=` / `?class=` are resolved
 * here, same shape as `/account` `?authError=`. Do not invent room chrome.
 */
export default async function LeaderboardRoute({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  return (
    <LeaderboardPage
      initialBoard={first(sp.board)}
      initialScope={first(sp.scope)}
      initialClass={first(sp.class)}
    />
  );
}
