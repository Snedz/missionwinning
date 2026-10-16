import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MissionLanding } from '@/page-components/MissionLanding';
import { GateTeaser } from './private/GateTeaser';
import { homeSurfaceAfterGate, isUngatedDoor } from '@/lib/homeSurface';
import { hasPrivateAccessCookieOnServer } from '@/lib/privateGateServer';
import { isPrivateModeEnabled } from '@/lib/privateModeFlag';
import { publicPageMetadata } from '@/lib/seoMetadata';
import {
  asJsonLdGraph,
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
 * Cookie → MissionLanding — the Z.ai Ironhouse port, rebranded (was LandingPage).
 * Not cinematic www. FAQ JSON-LD stays off this page; the page has no FAQ.
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
      <MissionLanding />
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
