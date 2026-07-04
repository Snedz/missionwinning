import Link from 'next/link';
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
        <ul className="grid gap-2 sm:grid-cols-2">
          {EXERCISES.map((ex) => (
            <li key={ex.id}>
              <Link
                href={`/exercises/${ex.id}`}
                className="content-card pressable-card block px-4 py-3 text-sm"
              >
                <span className="font-medium">{ex.name}</span>
                <span className="text-muted-foreground ml-2">· {ex.muscleGroups.join(', ')}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
