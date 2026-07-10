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
      <main className="mx-auto max-w-4xl px-5 py-10">
        <ExercisesPublicFilter />
      </main>
      <PublicSeoFooter />
    </div>
  );
}
