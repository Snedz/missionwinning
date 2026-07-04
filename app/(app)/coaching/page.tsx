import type { Metadata } from 'next';
import { CoachingPage } from '@/page-components/CoachingPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('coaching');

export default function Coaching() {
  return <CoachingPage />;
}
