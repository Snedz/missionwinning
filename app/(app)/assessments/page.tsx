import type { Metadata } from 'next';
import { AssessmentsPage } from '@/page-components/AssessmentsPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('assessments');

export default function Assessments() {
  return <AssessmentsPage />;
}
