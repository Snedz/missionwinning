import type { Metadata } from 'next';
import { MindPage } from '@/page-components/MindPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('mind');

type SearchParams = Promise<{ collection?: string | string[] }>;

function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * Mind first paint is house leftover. `useSearchParams()` made the page a
 * Suspense child. `?collection=` is resolved here, same shape as `/move`
 * `?collection=`. Do not restart Mind chrome.
 */
export default async function MindRoute({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  return <MindPage initialCollection={first(sp.collection)} />;
}
