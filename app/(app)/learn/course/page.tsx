import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { routeMetadata } from '@/lib/routeMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';

const LearnCoursePage = dynamic(
  () => import('@/page-components/LearnCoursePage').then((m) => m.LearnCoursePage),
  { loading: () => <RouteLoading label="Course" /> }
);

export const metadata: Metadata = routeMetadata('learn');

export default function LearnCourseRoute() {
  return (
    <Suspense fallback={<RouteLoading label="Course" />}>
      <LearnCoursePage />
    </Suspense>
  );
}
