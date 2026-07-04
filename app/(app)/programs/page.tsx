import type { Metadata } from 'next';
import { ProgramsPage } from '@/page-components/ProgramsPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('programs');

export default function Programs() {
  return <ProgramsPage />;
}
