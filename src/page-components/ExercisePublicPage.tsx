/**
 * Page: /exercises/[id] — public exercise detail (Server Component).
 * Catalog / form guides / SEO helpers stay on the server; only a tiny analytics beacon hydrates.
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { EXERCISES, getExerciseById } from '@/data/exercises';
import { getFormGuideOrCues } from '@/lib/formGuides';
import {
  enrichExerciseForPublic,
  relatedExercisesByPattern,
  guideChaptersForExercise,
  muscleHubSlug,
} from '@/lib/exerciseSeo';
import { inferFormPattern } from '@/lib/formPatterns';
import { PATTERN_FILTER_LABELS } from '@/lib/libraryFilters';
import { templatesUsingExercise } from '@/lib/exerciseUsage';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { ExercisePageBeacon } from '@/components/public/ExercisePageBeacon';
import type { Exercise } from '@/types';

type Props = {
  exercise: Exercise;
  jsonLd: Record<string, unknown> | Record<string, unknown>[];
};

export function ExercisePublicPage({ exercise: raw, jsonLd }: Props) {
  const exercise = enrichExerciseForPublic(raw);
  const pattern = inferFormPattern(exercise.id, exercise);
  const related = relatedExercisesByPattern(exercise, 6, inferFormPattern);
  const guides = guideChaptersForExercise(exercise);
  const enrichment = 'enrichment' in exercise ? exercise.enrichment : undefined;
  const guide = getFormGuideOrCues(exercise.id, { exercise });
  const tipLines = enrichment?.formTips;
  const steps = enrichment?.steps;
  const mistakes = enrichment?.mistakes;
  const safety = enrichment?.safety;
  const usedIn = templatesUsingExercise(exercise.id, 8);

  const alternatives = (exercise.alternatives ?? [])
    .map((id) => {
      const alt = getExerciseById(id);
      return alt ? { id, name: alt.name } : null;
    })
    .filter((x): x is { id: string; name: string } => x != null);

  const subtitleParts = [
    pattern ? PATTERN_FILTER_LABELS[pattern] : null,
    exercise.muscleGroups.join(' · '),
    exercise.equipment || 'Various',
    exercise.level ?? null,
  ].filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ExercisePageBeacon exerciseId={exercise.id} />
      <PublicPageShell
        eyebrow="Free exercise library"
        title={exercise.name}
        subtitle={subtitleParts.join(' · ')}
        breadcrumb={
          <>
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
          </>
        }
      >
        {/* Craft-index detail order: media → coach language → depth → mesh */}
        {guide?.mediaUrl && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold uppercase tracking-wide text-foreground">
              Form diagram
            </h2>
            <div className="mb-2 overflow-hidden border-2 border-border bg-card">
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
                // Static form diagram under /public — plain img is intentional.
                <img
                  src={guide.mediaUrl}
                  alt={`${exercise.name} form diagram`}
                  loading="lazy"
                  decoding="async"
                  className="mx-auto w-full max-h-56 object-contain p-3"
                />
              )}
            </div>
            {guide.mediaCaption ? (
              <p className="text-xs text-muted-foreground">{guide.mediaCaption}</p>
            ) : null}
          </section>
        )}

        {exercise.cues && (
          <section>
            <h2 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Coach language
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{exercise.cues}</p>
          </section>
        )}

        {guide && (guide.setup.length > 0 || guide.execute.length > 0) && (
          <section className="space-y-3">
            {guide.setup.length > 0 && (
              <div>
                <h2 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Setup
                </h2>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {guide.setup.map((line, i) => (
                    <li key={`setup-${i}`}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {guide.execute.length > 0 && (
              <div>
                <h2 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Execute
                </h2>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {guide.execute.map((line, i) => (
                    <li key={`exec-${i}`}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {guide.commonErrors && guide.commonErrors.length > 0 && (
              <div>
                <h2 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Avoid
                </h2>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {guide.commonErrors.map((line, i) => (
                    <li key={`err-${i}`}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {!guide && tipLines && tipLines.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold uppercase tracking-wide text-foreground">Form tips</h2>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {tipLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {steps && steps.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold uppercase tracking-wide text-foreground">Step-by-step</h2>
            <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-2">
              {steps.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </section>
        )}

        {mistakes && mistakes.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold uppercase tracking-wide text-foreground">Common mistakes</h2>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {mistakes.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {safety ? (
          <section className="border-2 border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Safety: </span>
            {safety}
          </section>
        ) : null}

        {usedIn.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold uppercase tracking-wide text-foreground">
              Used in {usedIn.length} free template{usedIn.length === 1 ? '' : 's'}
            </h2>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {usedIn.map((hit) => (
                <li key={`${hit.kind}-${hit.name}`}>
                  <Link href="/builder" className="text-primary hover:underline">
                    {hit.name}
                  </Link>
                  <span className="text-muted-foreground">
                    {' '}
                    ({hit.kind === 'starter' ? 'starter' : 'template'})
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {alternatives.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold uppercase tracking-wide text-foreground">Alternatives</h2>
            <div className="flex flex-wrap gap-2">
              {alternatives.map((alt) => (
                <Link
                  key={alt.id}
                  href={`/exercises/${alt.id}`}
                  className="text-sm px-3 py-1.5 border-2 border-border bg-background hover:border-primary hover:bg-tint"
                >
                  {alt.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold uppercase tracking-wide text-foreground">
              {pattern
                ? `More ${PATTERN_FILTER_LABELS[pattern].toLowerCase()} pattern`
                : 'Related movements'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {related.map((ex) => (
                <Link
                  key={ex.id}
                  href={`/exercises/${ex.id}`}
                  className="text-sm px-3 py-1.5 border-2 border-primary bg-tint hover:bg-primary hover:text-primary-foreground"
                >
                  {ex.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {guides.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold uppercase tracking-wide text-foreground">Read in the free guide</h2>
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

        <div className="space-y-3 border-2 border-primary bg-tint p-5">
          <p className="text-sm text-muted-foreground">
            Log sets offline — no account, no AI API key. {EXERCISES.length} free exercise pages in
            the library.
          </p>
          <Link href="/welcome" className="primary-action">
            Track this exercise free →
          </Link>
        </div>
      </PublicPageShell>
    </>
  );
}
