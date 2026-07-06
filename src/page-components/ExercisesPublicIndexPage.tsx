import { ExercisesPublicFilter } from '@/components/public/ExercisesPublicFilter';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';
import { EXERCISES } from '@/data/exercises';

export function ExercisesPublicIndexPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-4xl px-5 py-12">
          <h1 className="display-section mb-4">Exercise Library</h1>
          <p className="text-muted-foreground">
            {EXERCISES.length} movements with cues and form guides — free to browse and track in the app.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10">
        <ExercisesPublicFilter />
      </main>
      <PublicSeoFooter />
    </div>
  );
}
