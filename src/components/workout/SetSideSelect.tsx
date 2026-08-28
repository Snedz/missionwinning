'use client';

/**
 * Compact optional L / R / Alt control for a completed set row (`.1042`).
 *
 * Native select — not three chips — so History stays load/reps first.
 * Empty is the default. No filled red (Log set owns `--accent-poster`).
 * Live logger chips stay on Train (`.724`).
 */

import { useTranslation } from 'react-i18next';
import {
  parseSetSide,
  SET_SIDES,
  type SetSide,
} from '@/lib/workout/unilateral';
import { cn } from '@/lib/utils';

type Props = {
  side: SetSide | undefined;
  onSetSide: (side: SetSide | undefined) => void;
  className?: string;
  testId?: string;
};

export function SetSideSelect({
  side,
  onSetSide,
  className,
  testId = 'set-side',
}: Props) {
  const { t } = useTranslation();
  const label = t('activeSetSideAria', { defaultValue: 'Set side' });
  return (
    <select
      aria-label={label}
      title={label}
      data-testid={testId}
      value={side === undefined ? '' : side}
      onChange={(e) => onSetSide(parseSetSide(e.target.value))}
      className={cn(
        'house-num h-11 min-h-[44px] min-w-[44px] tap-target',
        className
      )}
    >
      <option value="">{label}</option>
      {SET_SIDES.map((s) => (
        <option key={s} value={s}>
          {s === 'L'
            ? t('activeSetSideL', { defaultValue: 'L' })
            : s === 'R'
              ? t('activeSetSideR', { defaultValue: 'R' })
              : t('activeSetSideAlt', { defaultValue: 'Alt' })}
        </option>
      ))}
    </select>
  );
}
