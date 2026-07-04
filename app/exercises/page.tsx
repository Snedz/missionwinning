import type { Metadata } from 'next';
import { ExercisesPublicIndexPage } from '@/page-components/ExercisesPublicIndexPage';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Exercise Library — Free',
  description: 'Browse 200+ exercises with cues and form guides. Track any movement free in Mission Winning.',
};

export default function ExercisesIndexRoute() {
  return <ExercisesPublicIndexPage />;
}
