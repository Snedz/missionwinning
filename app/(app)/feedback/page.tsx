import type { Metadata } from 'next';
import { FeedbackPage } from '@/page-components/FeedbackPage';

export const metadata: Metadata = { title: 'Feedback' };

export default function Feedback() {
  return <FeedbackPage />;
}
