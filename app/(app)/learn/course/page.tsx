import type { Metadata } from 'next';
import { LearnCoursePage } from '@/page-components/LearnCoursePage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('learn');

export default function LearnCourseRoute() {
  return <LearnCoursePage />;
}
