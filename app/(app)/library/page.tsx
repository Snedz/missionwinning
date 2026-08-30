import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';
import { LibraryPage } from '@/page-components/LibraryPage';

export const metadata: Metadata = routeMetadata('library');

/**
 * Library first paint is house leftover. `dynamic()` + `RouteLoading`
 * made the served HTML a skeleton. Posters / merge stay parked in Show all.
 */
export default function LibraryRoute() {
  return <LibraryPage />;
}
