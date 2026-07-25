import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { notFound } from 'next/navigation';
import { ensureFullExerciseCatalog } from '@/data/exercises';
import { MAJOR_GROUPS } from '@/lib/muscleGroups';
import { exercisesForMuscle, muscleFromSlug, muscleHubSlug } from '@/lib/exerciseSeo';
import { ExerciseMuscleHubPage } from '@/page-components/ExerciseMuscleHubPage';

export const dynamic = 'force-static';

type Props = { params: Promise<{ group: string }> };

export function generateStaticParams() {
  return MAJOR_GROUPS.map((g) => ({ group: muscleHubSlug(g) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params;
  const muscle = muscleFromSlug(group);
  if (!muscle) return { title: 'Exercises' };
  return publicPageMetadata({
    title: `${muscle} exercises — free cues & tracking`,
    description: `Browse free ${muscle.toLowerCase()} exercises with form cues. Log them offline in Mission Winning — no account required.`,
    path: `/exercises/muscle/${group}`,
  });
}

export default async function MuscleHubRoute({ params }: Props) {
  const { group } = await params;
  const muscle = muscleFromSlug(group);
  if (!muscle) notFound();
  // Without this the hub lists only the base catalog — the slug list is static so the
  // page renders, it just silently omits most of the movements it claims to cover.
  await ensureFullExerciseCatalog();
  const exercises = exercisesForMuscle(muscle);
  return <ExerciseMuscleHubPage groupLabel={muscle} exercises={exercises} />;
}
