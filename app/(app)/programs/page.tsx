import type { Metadata } from 'next';
import { ProgramsPage } from '@/page-components/ProgramsPage';

export const metadata: Metadata = { title: 'Programs' };

export default function Programs() {
  return <ProgramsPage />;
}
