import type { Metadata } from 'next';
import { HistoryPage } from '@/page-components/HistoryPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('history');

export default function HistoryRoute() {
  return <HistoryPage />;
}
