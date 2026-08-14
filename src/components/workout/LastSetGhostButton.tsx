'use client';

/**
 * One-tap last working-set ghost (.738). Outline ink — Log set owns poster red.
 * Compact (ink dock) and desktop (paper table) share this control.
 */

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  formatLastSetGhostExtras,
  shouldOfferLastSetGhost,
  type LastSetGhost,
} from '@/lib/workout/lastSetGhost';

type Props = {
  ghost: LastSetGhost | null | undefined;
  dial: { reps: number; weight: number };
  onAccept: (ghost: { reps: number; weight: number }) => void;
  /** Ink dock vs paper table. */
  tone: 'ink' | 'paper';
};

export function LastSetGhostButton({ ghost, dial, onAccept, tone }: Props) {
  const { t } = useTranslation();
  if (!shouldOfferLastSetGhost(ghost, dial) || !ghost) return null;
  const extras = formatLastSetGhostExtras(ghost);
  const line = t('activeLastPerformance', {
    reps: ghost.reps,
    weight: ghost.weight,
    defaultValue: 'Last: {{reps}} × {{weight}}',
  });

  return (
    <button
      type="button"
      onClick={() => onAccept({ reps: ghost.reps, weight: ghost.weight })}
      data-testid="last-set-ghost"
      data-ghost-reps={ghost.reps}
      data-ghost-weight={ghost.weight}
      aria-label={t('activeCopyLast', { defaultValue: 'Copy last' })}
      className={cn(
        'min-h-[44px] w-full border-2 px-3 text-start text-sm font-semibold tabular-nums tap-target',
        tone === 'ink'
          ? 'mt-1.5 border-neutral-500 text-neutral-100 hover:bg-neutral-800'
          : 'mt-1.5 border-border text-foreground hover:bg-muted'
      )}
    >
      {line}
      {extras}
    </button>
  );
}
