import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { routeMetadata } from '@/lib/routeMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';

const BenchmarksPage = dynamic(
  () => import('@/page-components/BenchmarksPage').then((m) => m.BenchmarksPage),
  { loading: () => <RouteLoading label="Benchmarks" /> }
);

export const metadata: Metadata = routeMetadata('benchmarks');

export default function BenchmarksRoute() {
  return <BenchmarksPage />;
}
