import type { Metadata } from 'next';
import { MovePage } from '@/page-components/MovePage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('move');

export default function MoveRoute() {
  return <MovePage />;
}
