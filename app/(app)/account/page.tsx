import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { routeMetadata } from '@/lib/routeMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';

const AccountPage = dynamic(
  () => import('@/page-components/AccountPage').then((m) => m.AccountPage),
  { loading: () => <RouteLoading label="Account" /> }
);

export const metadata: Metadata = routeMetadata('account');

export default function AccountRoute() {
  return (
    <Suspense fallback={<RouteLoading label="Account" />}>
      <AccountPage />
    </Suspense>
  );
}
