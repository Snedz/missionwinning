import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('private');

/** Unlock redirect lives in page.tsx — layouts cannot read searchParams. */
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
