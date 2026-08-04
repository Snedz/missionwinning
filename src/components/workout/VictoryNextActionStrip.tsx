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
    <div className="border-2 border-primary bg-tint p-3 space-y-2 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
        {t('victoryNextLabel', { defaultValue: 'Next' })}
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t(nextAction.reasonKey, {
          defaultValue: nextAction.defaultReason,
        })}
      </p>
      <Button asChild className="w-full primary-action">
        <Link href={nextAction.href} onClick={onNavigate}>
          {t(nextAction.labelKey, {
            defaultValue: nextAction.defaultLabel,
          })}
        </Link>
      </Button>
    </div>
  );
}
