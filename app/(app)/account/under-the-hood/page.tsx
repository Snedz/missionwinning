import type { Metadata } from 'next';
import { UnderTheHoodPage } from '@/page-components/UnderTheHoodPage';

export const metadata: Metadata = {
  title: 'Under the Hood',
  description: 'Published Mission Points boosts and visibility filters.',
};

/**
 * Under the Hood first paint is house leftover. `dynamic()` + `RouteLoading`
 * made the served HTML a skeleton. Do not invent room chrome.
 */
export default function UnderTheHoodRoute() {
  return <UnderTheHoodPage />;
}
