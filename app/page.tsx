import { redirect } from 'next/navigation';
import { isPrivateModeEnabled } from '@/lib/privateGate';
import { LandingPage } from '@/page-components/LandingPage';

export default function MissionWinningLanding() {
  if (isPrivateModeEnabled()) {
    redirect('/private');
  }

  return <LandingPage />;
}
