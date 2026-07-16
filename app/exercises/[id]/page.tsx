import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EXERCISES, getExerciseById } from '@/data/exercises';
import { ExercisePublicPage } from '@/page-components/ExercisePublicPage';
import { breadcrumbJsonLd, exerciseHowToJsonLd } from '@/lib/publicSeo';
import { publicPageMetadata, siteBaseUrl } from '@/lib/seoMetadata';

export const dynamic = 'force-static';

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return EXERCISES.map((ex) => ({ id: ex.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ex = getExerciseById(id);
  if (!ex) return { title: 'Exercise' };
  return publicPageMetadata({
    title: `${ex.name} — How to & cues`,
    description: ex.cues || `Learn ${ex.name} with form cues and alternatives.`,
    path: `/exercises/${id}`,
  });
}

export default async function ExerciseDetailRoute({ params }: Props) {
  const { id } = await params;
  const exercise = getExerciseById(id);
  if (!exercise) notFound();
  const base = siteBaseUrl();
  const { enrichExerciseForPublic } = await import('@/lib/exerciseSeo');
  const enriched = enrichExerciseForPublic(exercise);
  const steps = enriched.enrichment?.steps;
  const jsonLd = [
    exerciseHowToJsonLd(exercise, base, steps),
    breadcrumbJsonLd(
      [
        { name: 'Exercises', path: '/exercises' },
        { name: exercise.name, path: `/exercises/${exercise.id}` },
      ],
      base
    ),
  ];
  return <ExercisePublicPage exercise={exercise} jsonLd={jsonLd} />;
}
