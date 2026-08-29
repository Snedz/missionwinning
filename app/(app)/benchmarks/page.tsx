import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';
import { BenchmarksPage } from '@/page-components/BenchmarksPage';

export const metadata: Metadata = routeMetadata('benchmarks');

/**
 * Benchmarks first paint is house leftover. `dynamic()` + `RouteLoading`
 * made the served HTML a skeleton. 1RM chart stays parked.
 */
export default function BenchmarksRoute() {
  return <BenchmarksPage />;
}
