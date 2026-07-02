import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BundlePage } from '@/page-components/BundlePage';
import { BundleMarketingLayout } from '@/components/marketing/BundleMarketingLayout';
import { bundlePageMetadata } from '@/lib/marketingMetadata';

export const metadata: Metadata = bundlePageMetadata();

function BundleFallback() {
  return (
    <div className="max-w-4xl mx-auto py-12 text-center text-muted-foreground animate-pulse">
      Loading pricing…
    </div>
  );
}

export default function SuperBundleRoute() {
  return (
    <BundleMarketingLayout>
      <Suspense fallback={<BundleFallback />}>
        <BundlePage />
      </Suspense>
    </BundleMarketingLayout>
  );
}
