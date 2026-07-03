import type { Metadata } from 'next';
import { CoachingPage } from '@/page-components/CoachingPage';

export const metadata: Metadata = { title: 'Coaching' };

export default function Coaching() {
  return <CoachingPage />;
}
