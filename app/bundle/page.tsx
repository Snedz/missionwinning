import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BundlePage } from '@/page-components/BundlePage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('bundle');

export default function SuperBundleRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BundlePage />
    </Suspense>
  );
}
