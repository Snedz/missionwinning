import type { Metadata } from 'next';
import { FlagsConsolePage } from '@/page-components/FlagsConsolePage';

export const metadata: Metadata = {
  title: 'Feature flags',
  description: 'Founder staged rollouts. Closed catalog. Never gates Train.',
  robots: { index: false, follow: false },
};

/**
 * Flags console first paint is house leftover. `dynamic()` + `RouteLoading`
 * made the served HTML a skeleton. Do not invent room chrome.
 */
export default function FlagsConsoleRoute() {
  return <FlagsConsolePage />;
}
