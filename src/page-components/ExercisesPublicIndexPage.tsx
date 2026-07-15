/**
 * Page: /exercises — public exercise catalog
 * See: app/INDEX.md, src/page-components/INDEX.md
 */
import { ExercisesPublicFilter } from '@/components/public/ExercisesPublicFilter';
import { PublicSeoHeader } from '@/components/public/PublicSeoHeader';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';
import { EXERCISES, ensureFullExerciseCatalog } from '@/data/exercises';

export async function ExercisesPublicIndexPage() {
  await ensureFullExerciseCatalog();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicSeoHeader
        eyebrow="Free to browse"
        title="Exercise Library"
        subtitle={`${EXERCISES.length} movements with cues and form guides — free to browse and track in the app.`}
      />
      <main className="mx-auto max-w-4xl px-5 py-10 space-y-8">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-xs uppercase tracking-wide text-muted-foreground self-center me-1">
            Hubs
          </span>
          {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'].map((g) => (
            <a
              key={g}
              href={`/exercises/muscle/${g.toLowerCase()}`}
              className="px-3 py-1 rounded-full border border-border/60 hover:border-primary/40 text-xs"
            >
              {g}
            </a>
          ))}
          <a
            href="/exercises/equipment/bodyweight"
            className="px-3 py-1 rounded-full border border-primary/40 text-xs text-primary"
          >
            Bodyweight
          </a>
        </div>
        <ExercisesPublicFilter />
      </main>
      <PublicSeoFooter />
    </div>
  );
}
