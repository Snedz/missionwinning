import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { LearnPage } from '@/page-components/LearnPage';

export const metadata: Metadata = publicPageMetadata({
  title: 'Learn',
  description: 'Practical training education and specialist programs.',
  path: '/learn',
});

type SearchParams = Promise<{ path?: string | string[] }>;

function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * Learn first paint is house leftover. `dynamic()` + `RouteLoading` plus
 * `useSearchParams()` made the served HTML a skeleton ("Loading Learn…").
 * `?path=` is resolved here, same shape as `/mind` `?collection=`.
 * Do not restart Learn chrome. Guide / course stay parked.
 */
export default async function LearnRoute({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  return <LearnPage initialPath={first(sp.path)} />;
}
