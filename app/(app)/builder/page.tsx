import type { Metadata } from 'next';
import { BuilderPage } from '@/page-components/BuilderPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('builder');

export default function BuilderRoute() {
  return <BuilderPage />;
}
