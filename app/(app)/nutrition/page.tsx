import type { Metadata } from 'next';
import { NutritionPage } from '@/page-components/NutritionPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('nutrition');

export default function NutritionRoute() {
  return <NutritionPage />;
}
