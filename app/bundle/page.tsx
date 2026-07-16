import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BundlePage } from '@/page-components/BundlePage';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { productJsonLd } from '@/lib/publicSeo';

export const metadata: Metadata = publicPageMetadata({
  title: 'Super Bundle',
  description:
    'One subscription unlocks premium depth across Train, Fuel, Move, Mind, Track, and Learn. Free core stays free forever.',
  path: '/bundle',
});

export default function SuperBundleRoute() {
  const jsonLd = productJsonLd();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <BundlePage />
      </Suspense>
    </>
  );
}
