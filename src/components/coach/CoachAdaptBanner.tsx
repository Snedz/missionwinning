'use client';

import { useTranslation } from 'react-i18next';
import type { CoachPlan } from '@/lib/coach/types';
import {
  hasCoachAdaptationSignal,
  summarizeCoachAdaptations,
} from '@/lib/coach/adaptSummary';

type Props = {
  plan: CoachPlan;
  /** Compact for Today card — one beat only. */
  compact?: boolean;
};

/**
 * Demo-critical: partners must see log/miss → week changed in ≤60s.
 * Surfaces existing adaptPlan outcomes — not a new engine.
 * D2: glanceable — headline + one beat by default; full list only when not compact.
 */
export function CoachAdaptBanner({ plan, compact }: Props) {
  const { t } = useTranslation();
  const beats = summarizeCoachAdaptations(plan);
  if (!hasCoachAdaptationSignal(plan) && beats.length === 0) return null;

  const showHeadline = beats.length > 0 || plan.revision > 1;
  if (!showHeadline) return null;

  const visibleBeats = compact ? beats.slice(0, 1) : beats.slice(0, 3);

  return (
    <div
      className={
        compact
          ? 'rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 space-y-1'
          : 'rounded-xl border border-primary/35 bg-primary/5 px-4 py-3 space-y-2'
      }
      data-testid="coach-adapt-banner"
    >
      <p
        className={
          compact
            ? 'text-[10px] uppercase tracking-widest font-medium text-primary'
            : 'text-xs uppercase tracking-widest font-medium text-primary'
        }
      >
        {t('coachAdaptHeadline', {
          defaultValue: 'Adapted from your logs — no wearable needed',
        })}
      </p>
      {visibleBeats.length > 0 ? (
        <ul className={compact ? 'space-y-1' : 'space-y-1.5'}>
          {visibleBeats.map((beat) => (
            <li
              key={beat.key}
              className={
                compact
                  ? 'text-xs text-muted-foreground leading-relaxed'
                  : 'text-sm text-muted-foreground leading-relaxed'
              }
            >
              {t(beat.key, {
                count: beat.count,
                defaultValue: beat.defaultMessage,
              })}
            </li>
          ))}
        </ul>
      ) : (
        <p
          className={
            compact
              ? 'text-xs text-muted-foreground leading-relaxed'
              : 'text-sm text-muted-foreground leading-relaxed'
          }
        >
          {t('coachAdaptRevisionNote', {
            rev: plan.revision,
            defaultValue: `Plan revision ${plan.revision} — week reshaped from workout history alone.`,
          })}
        </p>
      )}
    </div>
  );
}
