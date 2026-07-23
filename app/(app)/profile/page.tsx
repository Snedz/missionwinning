import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { routeMetadata } from '@/lib/routeMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';

const ProfilePage = dynamic(
  () => import('@/page-components/ProfilePage').then((m) => m.ProfilePage),
  { loading: () => <RouteLoading label="Profile" /> }
);

export const metadata: Metadata = routeMetadata('profile');

export default function ProfileRoute() {
  return (
    <Suspense fallback={<RouteLoading label="Profile" />}>
      <ProfilePage />
    </Suspense>
  );
}
