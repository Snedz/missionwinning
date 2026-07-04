'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { getExerciseById } from '@/data/exercises';
import { getFormGuide, hasFormGuide } from '@/lib/formGuides';
import { track } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import type { Exercise } from '@/types';

type Props = {
  exercise: Exercise;
  jsonLd: Record<string, unknown>;
};

export function ExercisePublicPage({ exercise, jsonLd }: Props) {
  useEffect(() => {
    track('exercise_page_viewed', { exerciseId: exercise.id });
  }, [exercise.id]);

  const guide = hasFormGuide(exercise.id) ? getFormGuide(exercise.id) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-5 py-10">
          <Link href="/exercises" className="text-sm text-primary hover:underline">
            ← All exercises
          </Link>
          <h1 className="display-section mt-4">{exercise.name}</h1>
          <p className="text-muted-foreground mt-2">
            {exercise.muscleGroups.join(' · ')} · {exercise.equipment || 'Various'}
            {exercise.level ? ` · ${exercise.level}` : ''}
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 space-y-6">
        {exercise.cues && (
          <section>
            <h2 className="font-semibold mb-2">Key cues</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{exercise.cues}</p>
          </section>
        )}
        {guide && (
          <section>
            <h2 className="font-semibold mb-2">Form guide</h2>
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
        <Button asChild variant="fitness" className="primary-action">
          <Link
            href="/welcome"
            onClick={() => track('public_cta_clicked', { target: '/welcome', exercise: exercise.id })}
          >
            Track this exercise free →
          </Link>
        </Button>
      </main>
    </div>
  );
}
