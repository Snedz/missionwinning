import type { Metadata } from 'next';
import { ExplorePlacesPage } from '@/page-components/ExplorePlacesPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('explore');

export default function Explore() {
  return <ExplorePlacesPage />;
}
