import type { Metadata } from 'next';
import { AccessibilityPage } from '@/page-components/AccessibilityPage';

export const metadata: Metadata = { title: 'Accessibility Statement' };

export default function Accessibility() {
  return <AccessibilityPage />;
}
