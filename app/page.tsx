import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isPrivateModeEnabled } from '@/lib/privateGate';
import { LandingPage } from '@/page-components/LandingPage';

export const metadata: Metadata = {
  title: 'Free Global Health App',
  description:
    'Start free in 2 minutes — workout logger, six pillars, offline PWA. Super Bundle unlocks AI Coach and premium depth.',
};

export default function MissionWinningLanding() {
  if (isPrivateModeEnabled()) {
    redirect('/private');
  }

  return <LandingPage />;
}
