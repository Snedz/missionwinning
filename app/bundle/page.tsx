import type { Metadata } from 'next';
import { BundlePage } from '@/page-components/BundlePage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('bundle');

export default function SuperBundleRoute() {
  return <BundlePage />;
}
