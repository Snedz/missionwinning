import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EXERCISES, getExerciseById } from '@/data/exercises';
import { ExercisePublicPage } from '@/page-components/ExercisePublicPage';
import { exerciseHowToJsonLd } from '@/lib/publicSeo';

export const dynamic = 'force-static';

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://missionwinning.com';

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return EXERCISES.map((ex) => ({ id: ex.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ex = getExerciseById(id);
  if (!ex) return { title: 'Exercise' };
  return {
    title: `${ex.name} — How to & cues`,
    description: ex.cues || `Learn ${ex.name} with form cues and alternatives.`,
  };
}

export default async function ExerciseDetailRoute({ params }: Props) {
  const { id } = await params;
  const exercise = getExerciseById(id);
  if (!exercise) notFound();
  const jsonLd = exerciseHowToJsonLd(exercise, base);
  return <ExercisePublicPage exercise={exercise} jsonLd={jsonLd} />;
}
