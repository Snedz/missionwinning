import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';
import { CoachPage } from '@/page-components/CoachPage';

export const metadata: Metadata = routeMetadata('coach');

type SearchParams = Promise<{ ask?: string | string[] }>;

/**
 * Coach first paint is house leftover. `dynamic()` + `RouteLoading`
 * made the served HTML a skeleton. `?ask=` is resolved here, same shape
 * as `/account` `?authError=`. Voice / LoadBand / LogCite / Manage stay parked.
 */
export default async function CoachRoute({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const raw = sp.ask;
  const askExerciseId = Array.isArray(raw) ? raw[0] : raw;

  return <CoachPage askExerciseId={askExerciseId?.trim() || undefined} />;
}
