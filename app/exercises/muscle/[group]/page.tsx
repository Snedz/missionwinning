import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
  return {
    title: `${muscle} exercises — free cues & tracking`,
    description: `Browse free ${muscle.toLowerCase()} exercises with form cues. Log them offline in Mission Winning — no account required.`,
  };
}

export default async function MuscleHubRoute({ params }: Props) {
  const { group } = await params;
  const muscle = muscleFromSlug(group);
  if (!muscle) notFound();
  const exercises = exercisesForMuscle(muscle);
  return <ExerciseMuscleHubPage groupLabel={muscle} exercises={exercises} />;
}
