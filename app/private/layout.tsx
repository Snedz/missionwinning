import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { routeMetadata } from '@/lib/routeMetadata';
import { hasServerPrivateAccess } from '@/lib/privateGateServer';

export const metadata: Metadata = routeMetadata('private');

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  if (await hasServerPrivateAccess()) {
    redirect('/');
  }

  return children;
}
