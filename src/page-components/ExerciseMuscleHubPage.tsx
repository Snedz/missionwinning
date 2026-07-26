/**
 * Page: /exercises/muscle/[group] — public muscle hub (Server Component).
 */

import Link from 'next/link';
import type { Exercise } from '@/types';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { EQUIPMENT_HUBS } from '@/lib/exerciseSeo';

type Props = {
  groupLabel: string;
  exercises: Exercise[];
};

export function ExerciseMuscleHubPage({ groupLabel, exercises }: Props) {
  return (
    <PublicPageShell
      eyebrow="Exercise hubs"
      title={`${groupLabel} exercises`}
      subtitle={`Free form cues and alternatives for ${exercises.length} ${groupLabel.toLowerCase()} movements — track them offline with no account.`}
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
                className="flex justify-between gap-3 rounded-xl border border-border/50 px-4 py-3 hover:border-primary/40 hover:bg-primary/10 transition-colors"
              >
                <span className="font-medium">{ex.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {ex.equipment || 'Various'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <section>
          <p className="eyebrow mb-3">By equipment</p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_HUBS.map((h) => (
              <Link
                key={h.slug}
                href={`/exercises/equipment/${h.slug}`}
                className="border border-border/60 px-3 py-1.5 text-xs transition-colors hover:border-primary/40 hover:bg-primary/10"
              >
                {h.label}
              </Link>
            ))}
          </div>
        </section>
    </PublicPageShell>
  );
}
