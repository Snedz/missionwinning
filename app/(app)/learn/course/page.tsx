import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';
import { LearnCoursePage } from '@/page-components/LearnCoursePage';

export const metadata: Metadata = routeMetadata('learn');

type SearchParams = Promise<{ chapter?: string | string[] }>;

function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * Course first paint is house leftover. `dynamic()` + `RouteLoading` plus
 * `useSearchParams()` made the served HTML a skeleton ("Loading Course…").
 * `?chapter=` is resolved here, same shape as `/learn` `?path=`.
 * Do not restyle CourseReader internals.
 */
export default async function LearnCourseRoute({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  return <LearnCoursePage initialChapter={first(sp.chapter)} />;
}
