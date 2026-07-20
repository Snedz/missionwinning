import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { routeMetadata } from '@/lib/routeMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';

const NutritionPage = dynamic(
  () => import('@/page-components/NutritionPage').then((m) => m.NutritionPage),
  { loading: () => <RouteLoading label="Fuel" /> }
);

export const metadata: Metadata = routeMetadata('nutrition');

export default function NutritionRoute() {
  return <NutritionPage />;
}
