import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';
import { TrackPage } from '@/page-components/TrackPage';

export const metadata: Metadata = routeMetadata('track');

/**
 * Track first paint is house leftover. `dynamic()` + `RouteLoading`
 * made the served HTML a skeleton. Walks / GPS stay parked.
 */
export default function TrackRoute() {
  return <TrackPage />;
}
