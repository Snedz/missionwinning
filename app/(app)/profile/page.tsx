import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';
import { ProfilePage } from '@/page-components/ProfilePage';

export const metadata: Metadata = routeMetadata('profile');

/**
 * You first paint is house leftover. `dynamic()` + `RouteLoading` made the
 * served HTML a skeleton ("Loading Profile…"). ProfilePage does not read
 * `useSearchParams`, so there is no Suspense child.
 */
export default function ProfileRoute() {
  return <ProfilePage />;
}
