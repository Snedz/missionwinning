import type { Metadata } from 'next';
import { ServerPage } from '@/page-components/ServerPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = {
  ...routeMetadata('server'),
  robots: { index: false, follow: false },
};

export default function ServerRoute() {
  return <ServerPage />;
}
