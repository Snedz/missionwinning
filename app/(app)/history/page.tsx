import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';
import { HistoryPage } from '@/page-components/HistoryPage';

export const metadata: Metadata = routeMetadata('history');

/**
 * History list first paint is house leftover. `dynamic()` + `RouteLoading`
 * made the served HTML a skeleton. Calendar / charts stay parked in Show all.
 */
export default function HistoryRoute() {
  return <HistoryPage />;
}
