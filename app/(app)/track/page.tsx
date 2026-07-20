import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { routeMetadata } from '@/lib/routeMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';

const TrackPage = dynamic(
  () => import('@/page-components/TrackPage').then((m) => m.TrackPage),
  { loading: () => <RouteLoading label="Track" /> }
);

export const metadata: Metadata = routeMetadata('track');

export default function TrackRoute() {
  return <TrackPage />;
}
