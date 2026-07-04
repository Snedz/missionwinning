import type { Metadata } from 'next';
import { LibraryPage } from '@/page-components/LibraryPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('library');

export default function LibraryRoute() {
  return <LibraryPage />;
}
