import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';
import { ActiveWorkoutPage } from '@/page-components/ActiveWorkoutPage';

export const metadata: Metadata = routeMetadata('active');

export default function ActiveRoute() {
  return <ActiveWorkoutPage />;
}
