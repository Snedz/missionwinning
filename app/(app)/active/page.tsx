import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { routeMetadata } from '@/lib/routeMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';

const ActiveWorkoutPage = dynamic(
  () => import('@/page-components/ActiveWorkoutPage').then((m) => m.ActiveWorkoutPage),
  { loading: () => <RouteLoading label="Workout" /> }
);

export const metadata: Metadata = routeMetadata('active');

export default function ActiveRoute() {
  return <ActiveWorkoutPage />;
}
