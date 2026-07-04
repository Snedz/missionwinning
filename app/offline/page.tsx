import type { Metadata } from 'next';
import { OfflineContent } from './OfflineContent';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('offline');

export default function OfflinePage() {
  return <OfflineContent />;
}
