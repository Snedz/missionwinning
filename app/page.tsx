import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LandingPage } from '@/page-components/LandingPage';
import { GateTeaser } from './private/GateTeaser';
import { homeSurfaceAfterGate, isUngatedDoor } from '@/lib/homeSurface';
import { hasPrivateAccessCookieOnServer } from '@/lib/privateGateServer';
import { isPrivateModeEnabled } from '@/lib/privateModeFlag';
import { isLandingV2Enabled } from '@/lib/landingV2Flag';
import { LANDING_PREVIEW_EN as copy } from '@/i18n/landingPreviewLocales';
import { publicPageMetadata } from '@/lib/seoMetadata';
import {
  asJsonLdGraph,
  organizationJsonLd,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from '@/lib/publicSeo';

const forgeMetadata: Metadata = publicPageMetadata({
  title: 'Log a set.',
  description:
    'Free offline workout logger + adaptive Mission Coach from your logs — no wearable required. Free core forever. Works offline, anywhere.',
  path: '/',
});

export function generateMetadata(): Metadata {
  if (!isLandingV2Enabled()) return forgeMetadata;
  const base = publicPageMetadata({ title: copy.title, description: copy.description, path: '/' });
  const image = { url: '/brand/landing-share.png', width: 1200, height: 630, alt: copy.title };
  return {
    ...base,
    openGraph: { ...base.openGraph, images: [image] },
    twitter: { ...base.twitter, card: 'summary_large_image', images: [image] },
  };
}

/**
 * Door vs homepage.
 *
 * Gate on + no cookie → `/private` (production www).
 * Cookie → LandingPage — the door, then the forge sheet.
 * Not cinematic www. Gate ifs below are unchanged.
 * Preview / local, no cookie → teaser. Done mints the cookie.
 * Production public flip (gate off) → homepage with no door.
 */
function Homepage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            asJsonLdGraph([
              organizationJsonLd(),
              webSiteJsonLd(),
              softwareApplicationJsonLd(),
            ]),
          ),
        }}
      />
      <LandingPage />
    </>
  );
}

export default async function MissionWinningLanding() {
  const cookie = await hasPrivateAccessCookieOnServer();
  const surface = homeSurfaceAfterGate({
    privateMode: isPrivateModeEnabled(),
    cookie,
    ungatedDoor: isUngatedDoor(),
  });
  if (surface === 'private') {
    redirect('/private');
  }
  if (surface === 'homepage') {
    if (isLandingV2Enabled()) {
      const { default: LandingV2Page } = await import('@/page-components/LandingV2Page');
      return <LandingV2Page />;
    }
    return <Homepage />;
  }
  return <GateTeaser walkOpen />;
}
