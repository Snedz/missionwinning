import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { routeMetadata } from '@/lib/routeMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';

const LibraryPage = dynamic(
  () => import('@/page-components/LibraryPage').then((m) => m.LibraryPage),
  { loading: () => <RouteLoading label="Library" /> }
);

export const metadata: Metadata = routeMetadata('library');

export default function LibraryRoute() {
  return <LibraryPage />;
}
