import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LandingPage } from '@/page-components/LandingPage';
import { siteDescription } from '@/lib/offlineCapability';
import { hasServerPrivateAccess } from '@/lib/privateGateServer';
import { publicPageMetadata } from '@/lib/seoMetadata';
import {
  faqPageJsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from '@/lib/publicSeo';

export const metadata: Metadata = publicPageMetadata({
  title: 'Train Anywhere. Win Daily.',
  description: siteDescription(),
  path: '/',
});

/**
 * Landing stays request-aware for the private gate cookie.
 * (App) routes no longer force-dynamic — see app/(app)/layout.tsx.
 */
export default async function MissionWinningLanding() {
  if (!(await hasServerPrivateAccess())) {
    redirect('/private');
  }

  const graph = [
    organizationJsonLd(),
    webSiteJsonLd(),
    softwareApplicationJsonLd(),
    faqPageJsonLd(),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
      <LandingPage />
    </>
  );
}
