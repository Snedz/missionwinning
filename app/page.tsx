import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LandingPage } from '@/page-components/LandingPage';
import { GateTeaser } from './private/GateTeaser';
import { hasServerPrivateAccess } from '@/lib/privateGateServer';
import { isPrivateModeEnabled } from '@/lib/privateModeFlag';
import { publicPageMetadata } from '@/lib/seoMetadata';
import {
  faqPageJsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from '@/lib/publicSeo';

export const metadata: Metadata = publicPageMetadata({
  title: 'Train Anywhere. Win Daily.',
  description:
    'Free offline workout logger + adaptive Mission Coach from your logs — no wearable required. Free core forever. Works offline, anywhere.',
  path: '/',
});

/**
 * Door vs post-flip landing.
 *
 * Gate on + no cookie → `/private` (production www).
 * Gate on + cookie → cinematic LandingPage.
 * Gate off (Preview / local dev) → the same teaser as `/private`. Preview
 * inherits Production PRIVATE_MODE but short-circuits the gate so Train is
 * walkable; that used to paint the cinematic open landing on `/`.
 */
export default async function MissionWinningLanding() {
  if (isPrivateModeEnabled()) {
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

  return <GateTeaser />;
}
