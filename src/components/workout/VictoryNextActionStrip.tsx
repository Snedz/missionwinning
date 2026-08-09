'use client';

/**
 * Primary “Next” CTA block on Victory (.447).
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { VictoryNextAction } from '@/lib/workout/workoutVictory';

type Props = {
  nextAction: VictoryNextAction;
  onNavigate: () => void;
};

export function VictoryNextActionStrip({ nextAction, onNavigate }: Props) {
  const { t } = useTranslation();

  return (
    /*
     * Field manual honor beat: one red next, quiet reason — not a second poster
     * border fighting the title. Earned exit, not confetti chrome.
     */
    <div className="poster-field space-y-2.5 p-4 text-start">
      <p className="poster-kicker text-[11px] font-semibold uppercase tracking-[0.12em]">
        {t('victoryNextLabel', { defaultValue: 'Next' })}
      </p>
      <p className="poster-sub text-sm leading-relaxed">
        {t(nextAction.reasonKey, {
          defaultValue: nextAction.defaultReason,
        })}
      </p>
      <Button asChild className="primary-action w-full min-h-[52px]">
        <Link href={nextAction.href} onClick={onNavigate}>
          {t(nextAction.labelKey, {
            defaultValue: nextAction.defaultLabel,
          })}
        </Link>
      </Button>
    </div>
  );
}
