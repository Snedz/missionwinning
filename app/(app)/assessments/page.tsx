import type { Metadata } from 'next';
import { AssessmentsPage } from '@/page-components/AssessmentsPage';

export const metadata: Metadata = { title: 'Assessments' };

export default function Assessments() {
  return <AssessmentsPage />;
}
