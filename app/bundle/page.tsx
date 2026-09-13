import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BundlePage } from '@/page-components/BundlePage';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { productJsonLd } from '@/lib/publicSeo';
import { isFreeBeta } from '@/lib/freeBeta';

export const metadata: Metadata = publicPageMetadata({
  title: 'Super Bundle',
  description:
    'One subscription unlocks premium depth across Train, Fuel, Move, Mind, Track, and Learn. Free core stays free forever.',
  path: '/bundle',
});

type SearchParams = Promise<{ checkout?: string | string[] }>;

function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * Super Bundle first paint is house leftover. `useSearchParams()` plus
 * `Suspense` + `RouteLoading` made the served HTML a skeleton
 * ("Loading Super Bundle…"). `?checkout=` is resolved here, same shape
 * as `/account` `?authError=`. Free-beta still 307s to `/notify`.
 * Phantom checkout stays parked.
 */
export default async function SuperBundleRoute({ searchParams }: { searchParams: SearchParams }) {
  // Free-first beta: no paid merchandising while LLC/EIN clears.
  // F-047 — land on the notify form, not Today. Checkout stays dark.
  if (isFreeBeta()) redirect('/notify');

  const jsonLd = productJsonLd();
  const sp = await searchParams;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BundlePage initialCheckout={first(sp.checkout)} />
    </>
  );
}
