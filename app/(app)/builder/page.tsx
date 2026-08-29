import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';
import { BuilderPage } from '@/page-components/BuilderPage';

export const metadata: Metadata = routeMetadata('builder');

/**
 * Builder first paint is house leftover. `dynamic()` + `RouteLoading`
 * made the served HTML a skeleton. ProgramTemplatesPanel internals stay parked.
 */
export default function BuilderRoute() {
  return <BuilderPage />;
}
