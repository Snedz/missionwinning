import type { Metadata } from 'next';
import { CoachPage } from '@/page-components/CoachPage';
import { routeMetadata } from '@/lib/routeMetadata';

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
