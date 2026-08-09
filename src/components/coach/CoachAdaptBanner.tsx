'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { CoachPlan } from '@/lib/coach/types';
import {
  hasCoachAdaptationSignal,
  summarizeCoachAdaptations,
  todaySessionWhyKeys,
} from '@/lib/coach/adaptSummary';
import { coachAdaptReentrySession } from '@/lib/coach/coachAdaptReentry';
import { useStartCoachSession } from '@/hooks/useStartCoachSession';

type Props = {
  plan: CoachPlan;
  /** Compact for Today card — one beat only. */
  compact?: boolean;
  /**
   * Monday-based day offset for “today” in this plan week.
   * When a live (not-done) session matches, re-entry must not say Just Go.
   */
  todayOffset?: number;
  /** Open adjust-today sheet (keep / lighten my version) — full Coach only. */
  onAdjustToday?: () => void;
};

/**
 * Demo-critical: partners must see log/miss → week changed in ≤60s.
 * Surfaces existing adaptPlan outcomes — not a new engine.
 * D2: glanceable — headline + one beat by default; full list only when not compact.
 * `.287`: day-named adapt beats + today's prescription why keys (why panel).
 */
export function CoachAdaptBanner({ plan, compact, todayOffset, onAdjustToday }: Props) {
  const { t, i18n } = useTranslation();
  // Above the early returns below — this component bails in two places before
  // the re-entry block renders, and a hook after a conditional return is a
  // Rules-of-Hooks violation that only shows up once the bail path is taken.
  const startCoachSession = useStartCoachSession();
  const beats = summarizeCoachAdaptations(plan);
  const whyKeys =
    !compact && typeof todayOffset === 'number'
      ? todaySessionWhyKeys(plan, todayOffset)
      : [];
  if (!hasCoachAdaptationSignal(plan) && beats.length === 0 && whyKeys.length === 0) {
    return null;
  }

  const showHeadline = beats.length > 0 || plan.revision > 1 || whyKeys.length > 0;
  if (!showHeadline) return null;

  const visibleBeats = compact ? beats.slice(0, 1) : beats.slice(0, 3);
  const missedCount = plan.sessions.filter((s) => s.status === 'missed').length;
  const showReentry = !compact && missedCount > 0;
  const reentrySession = coachAdaptReentrySession(plan, todayOffset);

  return (
    <div
      className={
        // The ADAPTED banner: accent-100 fill behind a red edge, per the
        // handoff. It was a tinted box with a hairline border, which read as
        // one more panel rather than as the plan telling you it changed.
        compact
          ? 'border-s-[3px] border-s-[hsl(var(--accent-poster))] bg-muted px-3 py-2 space-y-1'
          : 'border-s-[3px] border-s-[hsl(var(--accent-poster))] bg-muted px-4 py-3 space-y-2'
      }
      data-testid="coach-adapt-banner"
    >
      <p
        className={
          // Field manual clarity: adapt reads as an explanation kicker, not a toast.
          compact
            ? 'eyebrow text-[10px] text-accent-900'
            : 'eyebrow text-accent-900'
        }
      >
        {t('coachAdaptHeadline', {
          defaultValue: 'Adapted from your logs — no wearable needed',
        })}
      </p>
      {visibleBeats.length > 0 ? (
        <ul className={compact ? 'space-y-1' : 'space-y-1.5 text-[15px] leading-snug'}>
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
                days: beat.days,
                defaultValue: beat.defaultMessage,
              })}
            </li>
          ))}
        </ul>
      ) : beats.length === 0 && whyKeys.length === 0 ? (
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
      ) : null}

      {whyKeys.length > 0 ? (
        <div className="space-y-1 pt-1" data-testid="coach-why-panel">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-accent-900">
            {t('coachWhyTodayEyebrow', { defaultValue: "Why today's plan" })}
          </p>
          <ul className="space-y-1">
            {whyKeys.map((key) => {
              const line = i18n.exists(key) ? t(key) : '';
              if (!line) return null;
              return (
                <li key={key} className="text-xs leading-relaxed text-muted-foreground">
                  {line}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {!compact && onAdjustToday ? (
        <button
          type="button"
          className="min-h-[44px] text-xs font-medium text-primary underline-offset-2 hover:underline"
          onClick={onAdjustToday}
        >
          {t('coachAdaptKeepVersion', {
            defaultValue: 'Adjust or keep my version of today',
          })}
        </button>
      ) : null}

      {showReentry && (
        <div className="pt-1 space-y-2">
          <p className="text-xs text-foreground">
            {t('coachAdaptReentryLead', {
              defaultValue: 'Ready to train again?',
            })}
          </p>
          <div className="flex flex-wrap gap-2">
            {/*
              K1 / `.278` honesty: when Mission Coach still has a live session
              today, the primary re-entry is that session — not freestyle Just Go.
            */}
            {reentrySession ? (
              /*
                A button, not a link. This said "Start this session" over
                `<Link href="/active">`, which starts nothing — `/active` with no
                active workout renders `ActiveEmptyState`, so the athlete tapped
                the one red control on a re-entry banner and landed on "No
                session running". Starting it here also runs the re-entry dose,
                which is the whole point of the surface it sits on.
              */
              <button
                type="button"
                onClick={() => startCoachSession(reentrySession, { from: 'reentry' })}
                className="inline-flex min-h-[44px] items-center border-2 border-border bg-primary-fill px-3 text-sm font-medium text-primary-foreground tap-target"
              >
                {t('coachStartSession', { defaultValue: 'Start this session' })}
              </button>
            ) : (
              /* Freestyle: `/active` is the destination, and picking exercises there is the point. */
              <Link
                href="/active"
                className="inline-flex min-h-[44px] items-center border-2 border-border bg-primary-fill px-3 text-sm font-medium text-primary-foreground tap-target"
              >
                {t('coachAdaptJustGo', { defaultValue: 'Just Go — log one set' })}
              </Link>
            )}
            <Link
              href="/log"
              className="inline-flex min-h-[44px] items-center border-2 border-border px-3 text-sm text-muted-foreground hover:text-foreground tap-target"
            >
              {t('coachAdaptLighterWeek', { defaultValue: 'Open Today' })}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
