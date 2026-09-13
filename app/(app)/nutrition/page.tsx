import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';
import { NutritionPage } from '@/page-components/NutritionPage';

export const metadata: Metadata = routeMetadata('nutrition');

/**
 * Fuel first paint is house leftover. `dynamic()` + `RouteLoading`
 * made the served HTML a skeleton. Search / barcode / recipes stay parked.
 */
export default function NutritionRoute() {
  return <NutritionPage />;
}
