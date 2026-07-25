import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EXERCISES, ensureFullExerciseCatalog, getExerciseById } from '@/data/exercises';
import { ExercisePublicPage } from '@/page-components/ExercisePublicPage';
import { breadcrumbJsonLd, exerciseHowToJsonLd } from '@/lib/publicSeo';
import { publicPageMetadata, siteBaseUrl } from '@/lib/seoMetadata';

export const dynamic = 'force-static';

type Props = { params: Promise<{ id: string }> };

/**
 * Every route below must await the catalog first.
 *
 * `EXERCISES` starts as the base ~126 entries; `ensureFullExerciseCatalog()` splices in
 * the extended and volume-2 modules to reach the full set. Without the await,
 * `generateStaticParams` only saw the base array, so **94 of the 219 exercise URLs in
 * `sitemap.xml` were never prerendered and returned 404** — a third of the advertised
 * SEO surface. `/exercises` showed the full count and linked to all of them, so the
 * library page itself was full of dead links.
 */
export async function generateStaticParams() {
  await ensureFullExerciseCatalog();
  return EXERCISES.map((ex) => ({ id: ex.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  await ensureFullExerciseCatalog();
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
  await ensureFullExerciseCatalog();
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
