import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isPrivateModeEnabled } from '@/lib/privateGate';
import { LandingPage } from '@/page-components/LandingPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('landing');

export default function MissionWinningLanding() {
  if (isPrivateModeEnabled()) {
    redirect('/private');
  }

  return <LandingPage />;
}
