'use client';

/**
 * Quiet Super Bundle continuity under Victory primary (one boss CTA stays above).
 * S6: at most one seam line — a muscle-matched free Move flow when the log has one.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { VictorySecondaryLink } from '@/lib/workout/victorySecondaryLinks';
import { MUSCLE_GROUP_I18N, type MuscleGroup } from '@/lib/muscleGroups';

type Props = {
  links: VictorySecondaryLink[];
  onNavigate: () => void;
};

export function VictorySecondaryLinks({ links, onNavigate }: Props) {
  const { t } = useTranslation();
  if (!links.length) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground"
      data-testid="victory-secondary-links"
    >
      {links.map((link, i) => (
        <span key={link.href} className="inline-flex items-center gap-x-3">
          {i > 0 ? <span aria-hidden>·</span> : null}
          <Link
            href={link.href}
            className="hover:text-foreground underline-offset-2 hover:underline"
            onClick={onNavigate}
            data-testid={link.kind === 'move' ? 'victory-move-seam' : undefined}
          >
            {link.kind === 'move' && link.flowName && link.muscle
              ? t('victorySecondaryMoveBecause', {
                  defaultValue: '{{flow}} — because you trained {{muscle}}',
                  flow: link.flowName,
                  muscle: MUSCLE_GROUP_I18N[link.muscle as MuscleGroup]
                    ? t(MUSCLE_GROUP_I18N[link.muscle as MuscleGroup], {
                        defaultValue: link.muscle,
                      })
                    : link.muscle,
                })
              : t(link.labelKey, { defaultValue: link.defaultLabel })}
          </Link>
        </span>
      ))}
    </div>
  );
}
