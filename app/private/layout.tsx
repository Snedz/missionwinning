import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('private');

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
