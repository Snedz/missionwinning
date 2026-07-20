import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { routeMetadata } from '@/lib/routeMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';

const HistoryPage = dynamic(
  () => import('@/page-components/HistoryPage').then((m) => m.HistoryPage),
  { loading: () => <RouteLoading label="History" /> }
);

export const metadata: Metadata = routeMetadata('history');

export default function HistoryRoute() {
  return <HistoryPage />;
}
