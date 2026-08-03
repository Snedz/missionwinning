/**
 * Page: /exercises/equipment/[slug] — public equipment hub (Server Component).
 */

import Link from 'next/link';
import type { Exercise } from '@/types';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { MAJOR_GROUPS } from '@/lib/muscleGroups';
import { muscleHubSlug } from '@/lib/exerciseSeo';

type Props = {
  equipmentLabel: string;
  exercises: Exercise[];
};

export function ExerciseEquipmentHubPage({ equipmentLabel, exercises }: Props) {
  return (
    <PublicPageShell
      eyebrow="Exercise hubs"
      title={`${equipmentLabel} exercises`}
      subtitle={`${exercises.length} free movements you can log offline — no gym membership required for bodyweight and minimal gear.`}
      breadcrumb={
        <Link href="/exercises" className="text-primary hover:underline">
          ← All exercises
        </Link>
      }
    >
        <ul className="space-y-2">
          {exercises.map((ex) => (
            <li key={ex.id}>
              <Link
                href={`/exercises/${ex.id}`}
                className="flex justify-between gap-3 border-2 border-border bg-card px-4 py-3 hover:border-primary hover:bg-tint transition-colors"
              >
                <span className="font-medium">{ex.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {ex.muscleGroups.join(', ')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <section>
          <p className="eyebrow mb-3">By muscle</p>
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
          </div>
        </section>
    </PublicPageShell>
  );
}
