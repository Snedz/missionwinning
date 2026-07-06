import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { routeMetadata } from '@/lib/routeMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';

const BuilderPage = dynamic(
  () => import('@/page-components/BuilderPage').then((m) => m.BuilderPage),
  { loading: () => <RouteLoading label="Builder" /> }
);

export const metadata: Metadata = routeMetadata('builder');

export default function BuilderRoute() {
  return <BuilderPage />;
}
