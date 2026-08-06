'use client';

/**
 * Post-session feel strip on Victory — 1–5 energy, free ritual (.429).
 */

import { useTranslation } from 'react-i18next';

type Props = {
  feelSaved: boolean;
  onSaveFeel: (energy: number) => void;
};

export function VictoryFeelStrip({ feelSaved, onSaveFeel }: Props) {
  const { t } = useTranslation();

  return (
    <div className="border-2 border-border bg-background px-3 py-3 space-y-2">
      <p className="text-center text-xs text-muted-foreground">
        {feelSaved
          ? t('victoryFeelSaved', { defaultValue: 'Saved for readiness.' })
          : t('victoryFeelPrompt', {
              defaultValue: 'How do you feel after this session?',
            })}
      </p>
      {!feelSaved && (
        <>
          <div
            className="flex border-2 border-border"
            role="group"
            aria-label={t('victoryFeelPrompt', {
              defaultValue: 'How do you feel after this session?',
            })}
          >
            {[1, 2, 3, 4, 5].map((n, i) => (
              <button
                key={n}
                type="button"
                onClick={() => onSaveFeel(n)}
                className={`flex-1 min-h-[52px] tap-target text-sm font-semibold text-foreground bg-card hover:bg-primary-fill hover:text-primary-foreground transition-colors ${
                  i > 0 ? 'border-s-2 border-border' : ''
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
            <span>{t('victoryFeelLow', { defaultValue: 'Drained' })}</span>
            <span>{t('victoryFeelHigh', { defaultValue: 'Energized' })}</span>
          </div>
        </>
      )}
    </div>
  );
}
