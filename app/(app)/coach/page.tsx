import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { routeMetadata } from '@/lib/routeMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';

const CoachPage = dynamic(
  () => import('@/page-components/CoachPage').then((m) => m.CoachPage),
  { loading: () => <RouteLoading label="Coach" /> }
);

export const metadata: Metadata = routeMetadata('coach');

type Props = {
  searchParams: Promise<{ ask?: string | string[] }>;
};

export default async function CoachRoute({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = sp.ask;
  const askExerciseId = Array.isArray(raw) ? raw[0] : raw;
  return <CoachPage askExerciseId={askExerciseId?.trim() || undefined} />;
}
