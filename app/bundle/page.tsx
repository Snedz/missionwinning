import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BundlePage } from '@/page-components/BundlePage';
import { MarketingShell } from '@/components/marketing/MarketingShell';

export const metadata: Metadata = {
  title: 'Super Bundle Pricing',
  description:
    'Six pillars, one subscription — AI Coach, premium Mind/Move/Track/Learn, and deep Fuel. Core tracking stays free forever.',
};

function BundleFallback() {
  return (
    <div className="max-w-4xl mx-auto py-12 text-center text-muted-foreground animate-pulse">
      Loading pricing…
    </div>
  );
}

export default function SuperBundleRoute() {
  return (
    <MarketingShell variant="bundle">
      <Suspense fallback={<BundleFallback />}>
        <BundlePage />
      </Suspense>
    </MarketingShell>
  );
}
