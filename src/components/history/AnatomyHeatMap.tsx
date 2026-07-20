'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { MuscleHeatCell } from '@/lib/historyAnalytics';
import { MAJOR_GROUPS, type MuscleGroup } from '@/lib/muscleGroups';

type Props = {
  cells: MuscleHeatCell[];
  className?: string;
};

function muscleHubSlug(g: MuscleGroup): string {
  return g.toLowerCase();
}

function fillFor(intensity: number, overdue: boolean): string {
  if (overdue) return 'hsl(var(--status-warn) / 0.45)';
  if (intensity >= 0.75) return 'hsl(var(--primary) / 0.55)';
  if (intensity >= 0.45) return 'hsl(var(--primary) / 0.35)';
  if (intensity >= 0.2) return 'hsl(var(--primary) / 0.18)';
  return 'hsl(var(--muted) / 0.5)';
}

/**
 * Front/back silhouette with tappable MAJOR_GROUPS regions.
 * Intensity from buildMuscleHeatmap; grid remains the a11y table alternative.
 */
export function AnatomyHeatMap({ cells, className }: Props) {
  const { t } = useTranslation();
  const byGroup = new Map(cells.map((c) => [c.group, c]));

  const region = (group: MuscleGroup) => {
    const cell = byGroup.get(group);
    const intensity = cell?.intensity ?? 0;
    const overdue = (cell?.daysSince ?? 0) >= 7;
    return {
      group,
      intensity,
      overdue,
      fill: fillFor(intensity, overdue),
    };
  };

  // Approximate torso regions — form-guide line style, 6 major groups
  const regions: Array<{
    group: MuscleGroup;
    view: 'front' | 'back';
    d: string;
  }> = [
    { group: 'Chest', view: 'front', d: 'M70 70 h60 v40 h-60 z' },
    { group: 'Shoulders', view: 'front', d: 'M45 55 h30 v25 h-30 z M125 55 h30 v25 h-30 z' },
    { group: 'Arms', view: 'front', d: 'M30 80 h18 v70 h-18 z M152 80 h18 v70 h-18 z' },
    { group: 'Core', view: 'front', d: 'M75 115 h50 v45 h-50 z' },
    { group: 'Legs', view: 'front', d: 'M65 165 h30 v70 h-30 z M105 165 h30 v70 h-30 z' },
    { group: 'Back', view: 'back', d: 'M70 65 h60 v55 h-60 z' },
  ];

  const front = regions.filter((r) => r.view === 'front');
  const back = regions.filter((r) => r.view === 'back');

  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground mb-2">
        {t('anatomyMapLead', {
          defaultValue: 'Tap a region for exercises. Color = recent volume; amber = overdue.',
        })}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <figure>
          <figcaption className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 text-center">
            {t('anatomyFront', { defaultValue: 'Front' })}
          </figcaption>
          <svg viewBox="0 0 200 260" className="w-full max-w-[180px] mx-auto" role="img" aria-label="Front anatomy">
            <ellipse cx="100" cy="28" rx="18" ry="22" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <path d="M70 55 Q100 48 130 55 L145 240 L55 240 Z" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {front.map((r) => {
              const st = region(r.group);
              return (
                <Link key={r.group + r.d} href={`/exercises/muscle/${muscleHubSlug(r.group)}`}>
                  <path
                    d={r.d}
                    fill={st.fill}
                    stroke="hsl(var(--foreground) / 0.25)"
                    strokeWidth="1"
                    className="cursor-pointer hover:opacity-90"
                  >
                    <title>{r.group}</title>
                  </path>
                </Link>
              );
            })}
          </svg>
        </figure>
        <figure>
          <figcaption className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 text-center">
            {t('anatomyBack', { defaultValue: 'Back' })}
          </figcaption>
          <svg viewBox="0 0 200 260" className="w-full max-w-[180px] mx-auto" role="img" aria-label="Back anatomy">
            <ellipse cx="100" cy="28" rx="18" ry="22" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <path d="M70 55 Q100 48 130 55 L145 240 L55 240 Z" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {back.map((r) => {
              const st = region(r.group);
              return (
                <Link key={r.group} href={`/exercises/muscle/${muscleHubSlug(r.group)}`}>
                  <path
                    d={r.d}
                    fill={st.fill}
                    stroke="hsl(var(--foreground) / 0.25)"
                    strokeWidth="1"
                    className="cursor-pointer hover:opacity-90"
                  >
                    <title>{r.group}</title>
                  </path>
                </Link>
              );
            })}
            {/* Shoulders/arms/legs on back for balance */}
            {(['Shoulders', 'Arms', 'Legs'] as MuscleGroup[]).map((g) => {
              const st = region(g);
              const d =
                g === 'Shoulders'
                  ? 'M45 55 h30 v25 h-30 z M125 55 h30 v25 h-30 z'
                  : g === 'Arms'
                    ? 'M30 80 h18 v70 h-18 z M152 80 h18 v70 h-18 z'
                    : 'M65 165 h30 v70 h-30 z M105 165 h30 v70 h-30 z';
              return (
                <Link key={`back-${g}`} href={`/exercises/muscle/${muscleHubSlug(g)}`}>
                  <path d={d} fill={st.fill} stroke="hsl(var(--foreground) / 0.2)" strokeWidth="1" className="cursor-pointer" />
                </Link>
              );
            })}
          </svg>
        </figure>
      </div>
      <ul className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        {MAJOR_GROUPS.map((g) => {
          const st = region(g);
          return (
            <li key={g}>
              <Link href={`/exercises/muscle/${muscleHubSlug(g)}`} className="hover:text-foreground underline-offset-2 hover:underline">
                {g}
                {st.overdue ? ' · overdue' : ''}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
