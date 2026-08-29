import type { Metadata } from 'next';
import { MovePage } from '@/page-components/MovePage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('move');

type SearchParams = Promise<{
  collection?: string | string[];
  flow?: string | string[];
}>;

function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * Move first paint is house leftover. `useSearchParams()` made the page a
 * Suspense child. `?collection=` / `?flow=` are resolved here, same shape as
 * `/leaderboard` `?board=`. Do not restart Move chrome.
 */
export default async function MoveRoute({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  return (
    <MovePage
      initialCollection={first(sp.collection)}
      initialFlow={first(sp.flow)}
    />
  );
}
