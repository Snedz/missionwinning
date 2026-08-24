import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { NotifyPage } from '@/page-components/NotifyPage';

export const metadata: Metadata = {
  ...publicPageMetadata({
    title: 'Get notified when checkout opens',
    description:
      'Stripe is not live yet. Leave an email — we will not charge you. The logger stays free.',
    path: '/notify',
  }),
  robots: { index: false, follow: false },
};

/**
 * Public Super Bundle notify — not the gated door, not a second landing band.
 * English chrome is the PublicPageShell contract. CTA is Log a set, not Start free.
 */
export default function NotifyRoute() {
  return (
    <PublicPageShell
      eyebrow="Super Bundle"
      title="Get notified when checkout opens"
      subtitle="Stripe is not live yet. Leave an email — we will not charge you. The logger stays free."
      ctaHref="/active"
      ctaLabel="Log a set"
    >
      <NotifyPage />
    </PublicPageShell>
  );
}
