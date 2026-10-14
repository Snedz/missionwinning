import type { Metadata } from 'next';
import { DataSafetyPage } from '@/page-components/DataSafetyPage';

export const metadata: Metadata = { title: 'App data safety' };

export default function DataSafety() {
  return <DataSafetyPage />;
}
