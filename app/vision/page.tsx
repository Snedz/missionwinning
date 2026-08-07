import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { VisionPage } from '@/page-components/VisionPage';
import { isFreeBeta } from '@/lib/freeBeta';

export const metadata: Metadata = publicPageMetadata({
  title: 'Vision',
  description: 'The guiding vision for the free global everything app for health.',
  path: '/vision',
});

/**
 * The landing page's poster close says "Read the full vision" and pointed at a
 * legal-appendix layout inside the signed-in shell. Public chrome + editorial
 * body now; English chrome is the `PublicPageShell` contract.
 */
export default function Vision() {
  return (
    <PublicPageShell
      eyebrow="Vision"
      title="Mission Winning Vision"
      subtitle={
        isFreeBeta()
          ? 'Free offline logger + Mission Coach from your logs — health fundamentals without a paywall.'
          : 'Free offline logger + Mission Coach from your logs. Super Bundle deepens the other pillars — it never gates the logger.'
      }
    >
      <VisionPage />
    </PublicPageShell>
  );
}
