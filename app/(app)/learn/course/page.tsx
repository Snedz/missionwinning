import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LearnCoursePage } from '@/page-components/LearnCoursePage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('learn');

export default function LearnCourseRoute() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground p-6">Loading…</p>}>
      <LearnCoursePage />
    </Suspense>
  );
}
