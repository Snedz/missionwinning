import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LandingPage } from '@/page-components/LandingPage';
import { GateTeaser } from './private/GateTeaser';
import { homeSurfaceAfterGate, isUngatedDoor } from '@/lib/homeSurface';
import { hasPrivateAccessCookieOnServer } from '@/lib/privateGateServer';
import { isPrivateModeEnabled } from '@/lib/privateModeFlag';
import { publicPageMetadata } from '@/lib/seoMetadata';
import {
  asJsonLdGraph,
  faqPageJsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from '@/lib/publicSeo';

export const metadata: Metadata = publicPageMetadata({
  title: 'Log a set. Offline.',
  description:
    'Free offline workout logger + adaptive Mission Coach from your logs — no wearable required. Free core forever. Works offline, anywhere.',
  path: '/',
});

/**
 * Door vs homepage.
 *
 * Gate on + no cookie → `/private` (production www).
 * Cookie → LandingPage — the .696 marketing homepage (Log a set /
 * Your week rewrites itself). Not cinematic www.
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
              faqPageJsonLd(),
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
    return <Homepage />;
  }
  return <GateTeaser walkOpen />;
}
