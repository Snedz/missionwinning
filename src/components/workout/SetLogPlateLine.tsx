'use client';

/**
 * Optional skippable plate breakdown on the live set table (.948).
 * Quiet ink — Log set owns poster red. Skip never blocks logging.
 * Bar is editable. Empty / 0 weight never reaches this chrome.
 */

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  barWeight: number;
  platesLine: string;
  onBarWeightChange: (next: number) => void;
  onSkip: () => void;
};

export function SetLogPlateLine({
  barWeight,
  platesLine,
  onBarWeightChange,
  onSkip,
}: Props) {
  const { t } = useTranslation();
  const barId = useId();
  const line = t('activePlateBarLine', {
    bar: barWeight,
    plates: platesLine,
    defaultValue: `${barWeight} + ${platesLine}`,
  });

  return (
    <div
      className="mt-1 flex min-w-0 items-center justify-between gap-2"
      data-testid="set-table-plates"
    >
      <div
        className="min-w-0 truncate text-[11px] tabular-nums text-muted-foreground"
        data-testid="set-table-plates-line"
        aria-label={t('activePlateBreakdownAria', {
          line,
          defaultValue: 'Plates on the bar: {{line}}',
        })}
      >
        <label className="sr-only" htmlFor={barId}>
          {t('activePlateBar', { defaultValue: 'Bar weight' })}
        </label>
        <input
          id={barId}
          type="text"
          inputMode="decimal"
          data-testid="set-table-plate-bar"
          aria-label={t('activePlateBar', { defaultValue: 'Bar weight' })}
          value={barWeight}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const cleaned = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
            const parsed = parseFloat(cleaned);
            if (Number.isFinite(parsed) && parsed > 0) {
              onBarWeightChange(Math.min(200, parsed));
            }
          }}
          className="house-num min-h-[44px] w-12 min-w-[44px] tap-target"
        />
        <span className="ms-1">{`+ ${platesLine}`}</span>
      </div>
      <button
        type="button"
        onClick={onSkip}
        data-testid="set-table-plates-skip"
        className="house-btn min-h-[44px] shrink-0 tap-target"
      >
        {t('activePlateSkip', { defaultValue: 'Skip' })}
      </button>
    </div>
  );
}
