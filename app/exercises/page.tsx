import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { CONTENT_FLOORS } from '@/lib/contentFloors';
import { ExercisesPublicIndexPage } from '@/page-components/ExercisesPublicIndexPage';

export const dynamic = 'force-static';

export const metadata: Metadata = publicPageMetadata({
  title: "Exercise Library",
  description: `${CONTENT_FLOORS.exercisePages} free exercise pages with form cues — bodyweight and minimal gear first.`,
  path: "/exercises",
});

export default function ExercisesIndexRoute() {
  return <ExercisesPublicIndexPage />;
}
