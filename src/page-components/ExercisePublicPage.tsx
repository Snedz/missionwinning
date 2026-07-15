'use client';
/**
 * Page: /exercises/[id] — public exercise detail
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useEffect } from 'react';
import { getExerciseById } from '@/data/exercises';
import { getFormGuideOrCues } from '@/lib/formGuides';
import {
  enrichExerciseForPublic,
  relatedExercises,
  guideChaptersForExercise,
  muscleHubSlug,
} from '@/lib/exerciseSeo';
import { track } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';
import { PublicSeoHeader } from '@/components/public/PublicSeoHeader';
import type { Exercise } from '@/types';

type Props = {
  exercise: Exercise;
  jsonLd: Record<string, unknown>;
};

export function ExercisePublicPage({ exercise: raw, jsonLd }: Props) {
  const exercise = enrichExerciseForPublic(raw);
  const related = relatedExercises(exercise, 6);
  const guides = guideChaptersForExercise(exercise);
  const enrichment = 'enrichment' in exercise ? exercise.enrichment : undefined;

  useEffect(() => {
    track('exercise_page_viewed', { exerciseId: exercise.id });
  }, [exercise.id]);

  const guide = getFormGuideOrCues(exercise.id, { exercise });
  const tipLines = enrichment?.formTips;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicSeoHeader
        eyebrow="Free exercise library"
        title={exercise.name}
        subtitle={`${exercise.muscleGroups.join(' · ')} · ${exercise.equipment || 'Various'}${
          exercise.level ? ` · ${exercise.level}` : ''
        }`}
      />
      <main className="mx-auto max-w-3xl px-5 py-10 space-y-8">
        <p className="text-sm">
          <Link href="/exercises" className="text-primary hover:underline">
            ← All exercises
          </Link>
          {exercise.muscleGroups[0] && (
            <>
              {' · '}
              <Link
                href={`/exercises/muscle/${muscleHubSlug(exercise.muscleGroups[0])}`}
                className="text-primary hover:underline"
              >
                More {exercise.muscleGroups[0]}
              </Link>
            </>
          )}
        </p>

        {exercise.cues && (
          <section>
            <h2 className="font-semibold mb-2">Key cues</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{exercise.cues}</p>
          </section>
        )}
        {guide && (
          <section>
            <h2 className="font-semibold mb-2">Form guide</h2>
            {guide.mediaUrl && (
              <div className="mb-4 overflow-hidden rounded-xl border border-border/40 bg-muted/30">
                {guide.mediaType === 'video' ? (
                  <video
                    className="w-full max-h-56 object-contain"
                    src={guide.mediaUrl}
                    controls
                    preload="none"
                    playsInline
                    aria-label={`${exercise.name} form video`}
                  >
                    <track kind="captions" srcLang="en" label="Captions" />
                  </video>
                ) : (
                  <img
                    src={guide.mediaUrl}
                    alt={`${exercise.name} form diagram`}
                    loading="lazy"
                    decoding="async"
                    className="mx-auto w-full max-h-56 object-contain p-3"
                  />
                )}
              </div>
            )}
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {guide.setup.map((line, i) => (
                <li key={`setup-${i}`}>{line}</li>
              ))}
              {guide.execute.map((line, i) => (
                <li key={`exec-${i}`}>{line}</li>
              ))}
            </ul>
          </section>
        )}
        {!guide && tipLines && tipLines.length > 0 && (
          <section>
            <h2 className="font-semibold mb-2">Form tips</h2>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {tipLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {exercise.alternatives && exercise.alternatives.length > 0 && (
          <section>
            <h2 className="font-semibold mb-2">Alternatives</h2>
            <div className="flex flex-wrap gap-2">
              {exercise.alternatives.map((id) => {
                const alt = getExerciseById(id);
                if (!alt) return null;
                return (
                  <Link
                    key={id}
                    href={`/exercises/${id}`}
                    className="text-sm px-3 py-1 rounded-full border border-border/60 hover:bg-muted/50"
                  >
                    {alt.name}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section>
            <h2 className="font-semibold mb-2">Related movements</h2>
            <div className="flex flex-wrap gap-2">
              {related.map((ex) => (
                <Link
                  key={ex.id}
                  href={`/exercises/${ex.id}`}
                  className="text-sm px-3 py-1 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/15"
                >
                  {ex.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {guides.length > 0 && (
          <section>
            <h2 className="font-semibold mb-2">Read in the free guide</h2>
            <ul className="space-y-2 text-sm">
              {guides.map((g) => (
                <li key={g.id}>
                  <Link href={`/guide/${g.id}`} className="text-primary hover:underline">
                    {g.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 space-y-3">
          <p className="text-sm text-muted-foreground">
            Log sets offline — no account, no AI API key. 217 free exercise pages in the library.
          </p>
          <Button asChild variant="fitness" className="primary-action">
            <Link
              href="/welcome"
              onClick={() => track('public_cta_clicked', { target: '/welcome', exercise: exercise.id })}
            >
              Track this exercise free →
            </Link>
          </Button>
        </div>
      </main>
      <PublicSeoFooter />
    </div>
  );
}
