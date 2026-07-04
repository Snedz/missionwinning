import type { Metadata } from 'next';
import { BenchmarksPage } from '@/page-components/BenchmarksPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('benchmarks');

export default function BenchmarksRoute() {
  return <BenchmarksPage />;
}
