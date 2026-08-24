import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { BundlePage } from '@/page-components/BundlePage';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { productJsonLd } from '@/lib/publicSeo';
import { RouteLoading } from '@/components/layout/RouteLoading';
import { isFreeBeta } from '@/lib/freeBeta';

export const metadata: Metadata = publicPageMetadata({
  title: 'Super Bundle',
  description:
    'One subscription unlocks premium depth across Train, Fuel, Move, Mind, Track, and Learn. Free core stays free forever.',
  path: '/bundle',
});

export default function SuperBundleRoute() {
  // Free-first beta: no paid merchandising while LLC/EIN clears.
  // F-047 — land on the notify form, not Today. Checkout stays dark.
  if (isFreeBeta()) redirect('/notify');

  const jsonLd = productJsonLd();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<RouteLoading label="Super Bundle" />}>
        <BundlePage />
      </Suspense>
    </>
  );
}
