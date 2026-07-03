import type { Metadata } from 'next';
import { GuidebookIndexPage } from '@/page-components/GuidebookIndexPage';

export const metadata: Metadata = { title: 'Guidebook' };

export default function GuidebookIndexRoute() {
  return <GuidebookIndexPage />;
}
