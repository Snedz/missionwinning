/**
 * Page: /exercises — public exercise catalog
 * See: app/INDEX.md, src/page-components/INDEX.md
 */
import Link from 'next/link';
import { ExercisesPublicFilter } from '@/components/public/ExercisesPublicFilter';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { EXERCISES, ensureFullExerciseCatalog } from '@/data/exercises';
import { MAJOR_GROUPS } from '@/lib/muscleGroups';
import { muscleHubSlug } from '@/lib/exerciseSeo';

export async function ExercisesPublicIndexPage() {
  await ensureFullExerciseCatalog();

  return (
    <PublicPageShell
      eyebrow="Free to browse"
      title="Exercise library"
      subtitle={`${EXERCISES.length} movements with cues and form guides — free to browse and track in the app.`}
      maxWidth="4xl"
    >
      <section>
        <p className="eyebrow mb-3">Hubs</p>
        <div className="flex flex-wrap gap-2">
          {MAJOR_GROUPS.map((g) => (
            <Link
              key={g}
              href={`/exercises/muscle/${muscleHubSlug(g)}`}
              className="border-2 border-border bg-background px-3 py-1.5 text-xs transition-colors hover:border-primary hover:bg-tint"
            >
              {g}
            </Link>
          ))}
          <Link
            href="/exercises/equipment/bodyweight"
            className="border-2 border-primary bg-tint px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Bodyweight
          </Link>
        </div>
      </section>
      <ExercisesPublicFilter />
    </PublicPageShell>
  );
}
