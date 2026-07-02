import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isPrivateModeEnabled } from '@/lib/privateGate';
import { LandingPage } from '@/page-components/LandingPage';
import { landingPageMetadata } from '@/lib/marketingMetadata';

export const metadata: Metadata = landingPageMetadata();

export default function MissionWinningLanding() {
  if (isPrivateModeEnabled()) {
    redirect('/private');
  }

  return <LandingPage />;
}
