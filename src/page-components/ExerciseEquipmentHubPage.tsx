'use client';
/**
 * Page: /exercises/equipment/[slug] — public equipment hub
 */

import Link from 'next/link';
import type { Exercise } from '@/types';
import { PublicSeoHeader } from '@/components/public/PublicSeoHeader';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';
import { MAJOR_GROUPS } from '@/lib/muscleGroups';
import { muscleHubSlug } from '@/lib/exerciseSeo';

type Props = {
  equipmentLabel: string;
  exercises: Exercise[];
};

export function ExerciseEquipmentHubPage({ equipmentLabel, exercises }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicSeoHeader
        eyebrow="Exercise hubs"
        title={`${equipmentLabel} exercises`}
        subtitle={`${exercises.length} free movements you can log offline — no gym membership required for bodyweight and minimal gear.`}
      />
      <main className="mx-auto max-w-3xl px-5 py-10 space-y-6">
        <p className="text-sm">
          <Link href="/exercises" className="text-primary hover:underline">
            ← All exercises
          </Link>
        </p>
        <ul className="space-y-2">
          {exercises.map((ex) => (
            <li key={ex.id}>
              <Link
                href={`/exercises/${ex.id}`}
                className="flex justify-between gap-3 rounded-xl border border-border/50 px-4 py-3 hover:border-primary/40 hover:bg-primary/10 transition-colors"
              >
                <span className="font-medium">{ex.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {ex.muscleGroups.join(', ')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="pt-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">By muscle</p>
          <div className="flex flex-wrap gap-2">
            {MAJOR_GROUPS.map((g) => (
              <Link
                key={g}
                href={`/exercises/muscle/${muscleHubSlug(g)}`}
                className="text-xs px-3 py-1 rounded-full border border-border/60 hover:bg-muted/40"
              >
                {g}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <PublicSeoFooter />
    </div>
  );
}
