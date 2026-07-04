import type { Metadata } from 'next';
import { HomePage } from '@/page-components/HomePage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('log');

export default function LogDashboard() {
  return <HomePage />;
}
