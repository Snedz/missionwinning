import type { Metadata } from 'next';
import { ActiveWorkoutPage } from '@/page-components/ActiveWorkoutPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('active');

export default function ActiveRoute() {
  return <ActiveWorkoutPage />;
}
