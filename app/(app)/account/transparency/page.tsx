import type { Metadata } from 'next';
import { TransparencyPage } from '@/page-components/TransparencyPage';

export const metadata: Metadata = {
  title: 'Visibility',
  description: 'See if anything is limited, the exact reason, and download the report.',
};

/**
 * Visibility first paint is house leftover. `dynamic()` + `RouteLoading`
 * made the served HTML a skeleton. Do not invent room chrome.
 */
export default function TransparencyRoute() {
  return <TransparencyPage />;
}
