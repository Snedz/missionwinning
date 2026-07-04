import type { Metadata } from 'next';
import { ProfilePage } from '@/page-components/ProfilePage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('profile');

export default function ProfileRoute() {
  return <ProfilePage />;
}
