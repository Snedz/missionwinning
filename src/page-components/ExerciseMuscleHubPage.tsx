/**
 * Page: /exercises/muscle/[group] — public muscle hub (Server Component).
 */

import Link from 'next/link';
import type { Exercise } from '@/types';
import { PublicSeoHeader } from '@/components/public/PublicSeoHeader';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';
import { EQUIPMENT_HUBS } from '@/lib/exerciseSeo';

type Props = {
  groupLabel: string;
  exercises: Exercise[];
};

export function ExerciseMuscleHubPage({ groupLabel, exercises }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicSeoHeader
        eyebrow="Exercise hubs"
        title={`${groupLabel} exercises`}
        subtitle={`Free form cues and alternatives for ${exercises.length} ${groupLabel.toLowerCase()} movements — track them offline with no account.`}
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
                  {ex.equipment || 'Various'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="pt-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">By equipment</p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_HUBS.map((h) => (
              <Link
                key={h.slug}
                href={`/exercises/equipment/${h.slug}`}
                className="text-xs px-3 py-1 rounded-full border border-border/60 hover:bg-muted/40"
              >
                {h.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <PublicSeoFooter />
    </div>
  );
}
