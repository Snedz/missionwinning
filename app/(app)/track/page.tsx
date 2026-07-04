import type { Metadata } from 'next';
import { TrackPage } from '@/page-components/TrackPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('track');

export default function TrackRoute() {
  return <TrackPage />;
}
