import type { Metadata } from 'next';
import { GuidebookIndexPage } from '@/page-components/GuidebookIndexPage';

export const metadata: Metadata = { title: 'Guidebook' };

/**
 * Guidebook first paint is house leftover. `dynamic()` + `RouteLoading`
 * made the served HTML a skeleton. Do not restyle guidebook internals.
 * Course / chapter stay parked.
 */
export default function GuidebookIndexRoute() {
  return <GuidebookIndexPage />;
}
