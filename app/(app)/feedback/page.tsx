import type { Metadata } from 'next';
import { FeedbackPage } from '@/page-components/FeedbackPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('feedback');

export default function Feedback() {
  return <FeedbackPage />;
}
