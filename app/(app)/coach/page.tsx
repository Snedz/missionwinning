import type { Metadata } from 'next';
import { CoachPage } from '@/page-components/CoachPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('coach');

export default function CoachRoute() {
  return <CoachPage />;
}
