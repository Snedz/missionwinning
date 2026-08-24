'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { CoachPlan } from '@/lib/coach/types';
import {
  hasCoachAdaptationSignal,
  summarizeCoachAdaptations,
  todaySessionWhyKeys,
} from '@/lib/coach/adaptSummary';
import { coachAdaptReentrySession } from '@/lib/coach/coachAdaptReentry';
import { coachWhyLine } from '@/lib/coach/coachWhyDefaults';
import {
  COACH_CITATION_COPY,
  coachCitationFact,
  coachLogCitationFromStorage,
  type CoachLogCitation,
} from '@/lib/coach/logCitation';
import {
  formatCoachWeekDiffLine,
  sessionCountChangeFromPlan,
} from '@/lib/coach/weekDiff';
import {
  buildWeekRationale,
  type WeekRationaleHints,
} from '@/lib/coach/weekRationale';
import { useStartCoachSession } from '@/hooks/useStartCoachSession';
import { useUnits } from '@/hooks/useUnits';
import { weightUnitLabel } from '@/lib/units';
import {
  applyPlannedMissSkip,
  applyPlannedMissSlide,
  findPlannedMiss,
} from '@/lib/coach/plannedMiss';
import { savePlan } from '@/lib/coach/storage';

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
  /**
   * Optional log-derived hints already computed upstream (history length, load band).
   * Never invent metrics here — only pass what CoachContext / loadBands already have.
   */
  rationaleHints?: WeekRationaleHints;
  /**
   * When true, paint log-cited why-this-week even without an adapt signal
   * (full Coach week block after generate). Compact Today keeps adapt-only.
   */
  showWeekRationale?: boolean;
};

/**
 * Demo-critical: partners must see log/miss → week changed in ≤60s.
 * Surfaces existing adaptPlan outcomes — not a new engine.
 * D2: glanceable — headline + one beat by default; full list only when not compact.
 * `.287`: day-named adapt beats + today's prescription why keys (why panel).
 * `.693`: log-cited why-this-week / adapt rationale (inputs · rule · effect).
 * `.861`: session-count proposal replaces the assertion when adapt changed the count (H-02).
 */
export function CoachAdaptBanner({
  plan,
  compact,
  todayOffset,
  onAdjustToday,
  rationaleHints,
  showWeekRationale,
}: Props) {
  const { t, i18n } = useTranslation();
  // Above the early returns below — this component bails in two places before
  // the re-entry block renders, and a hook after a conditional return is a
  // Rules-of-Hooks violation that only shows up once the bail path is taken.
  const startCoachSession = useStartCoachSession();
  const units = useUnits();
  const [citation, setCitation] = useState<CoachLogCitation | null>(null);
  useEffect(() => {
    setCitation(coachLogCitationFromStorage());
  }, []);
  const beats = summarizeCoachAdaptations(plan);
  const countChange = sessionCountChangeFromPlan(plan);
  const showCountDiff = countChange.beforeCount !== countChange.afterCount;
  const citeFact =
    citation && citation.kind !== 'no-logs'
      ? coachCitationFact(citation, i18n.language, weightUnitLabel(units))
      : null;
  const weekDiffLine = showCountDiff
    ? formatCoachWeekDiffLine(countChange.beforeCount, countChange.afterCount, citeFact)
    : null;
  const whyKeys =
    !compact && typeof todayOffset === 'number'
      ? todaySessionWhyKeys(plan, todayOffset)
      : [];
  const rationale =
    showWeekRationale || hasCoachAdaptationSignal(plan)
      ? buildWeekRationale(plan, rationaleHints)
      : null;
  if (
    !hasCoachAdaptationSignal(plan) &&
    beats.length === 0 &&
    whyKeys.length === 0 &&
    !rationale
  ) {
    return null;
  }

  const showHeadline =
    beats.length > 0 || plan.revision > 1 || whyKeys.length > 0 || !!rationale;
  if (!showHeadline) return null;

  const visibleBeats = compact ? beats.slice(0, 1) : beats.slice(0, 3);
  const missedCount = plan.sessions.filter((s) => s.status === 'missed').length;
  const plannedMiss =
    !compact && typeof todayOffset === 'number'
      ? findPlannedMiss(plan, todayOffset, { weekStart: plan.weekStart })
      : { show: false as const, session: null, canSlide: false as const };
  const showReentry = !compact && (missedCount > 0 || plannedMiss.show);
  const reentrySession =
    (plannedMiss.show ? plannedMiss.session : null) ??
    coachAdaptReentrySession(plan, todayOffset);
  const adaptSignal = hasCoachAdaptationSignal(plan);

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
        data-testid={weekDiffLine ? 'coach-week-diff' : undefined}
      >
        {weekDiffLine
          ? countChange.beforeCount === 1
            ? t('coachWeekDiffHeadlineOne', {
                after: countChange.afterCount,
                defaultValue: '1 session → {{after}}',
              })
            : t('coachWeekDiffHeadlineMany', {
                before: countChange.beforeCount,
                after: countChange.afterCount,
                defaultValue: '{{before}} sessions → {{after}}',
              })
          : adaptSignal
            ? t('coachAdaptHeadline', {
                defaultValue: 'Adapted from your logs — no wearable needed',
              })
            : t('coachWhyWeekEyebrow', {
                defaultValue: 'Why this week — from your logs',
              })}
      </p>

      {weekDiffLine && citeFact ? (
        <p
          className={
            compact
              ? 'text-xs text-muted-foreground leading-relaxed'
              : 'text-sm text-muted-foreground leading-relaxed'
          }
          data-testid="coach-week-diff-cite"
        >
          {t('coachCiteFromLog', {
            fact: citeFact,
            defaultValue: COACH_CITATION_COPY.fromLog,
          })}
        </p>
      ) : null}

      {/* Log-cited inspectability: inputs → rule → effect (a progression logger beat). */}
      {rationale && compact && !weekDiffLine ? (
        <p
          className="text-xs text-muted-foreground leading-relaxed"
          data-testid="coach-week-rationale"
        >
          {t(rationale.compactKey, {
            ...rationale.compactParams,
            defaultValue: rationale.compactDefault,
          })}
        </p>
      ) : null}
      {rationale && !compact ? (
        <div className="space-y-1.5" data-testid="coach-week-rationale">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">
              {t('coachRationaleInputLabel', { defaultValue: 'From your logs' })}
              {': '}
            </span>
            {t(rationale.inputKey, {
              ...rationale.inputParams,
              defaultValue: rationale.inputDefault,
            })}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">
              {t('coachRationaleRuleLabel', { defaultValue: 'Rule applied' })}
              {': '}
            </span>
            {t(rationale.ruleKey, { defaultValue: rationale.ruleDefault })}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">
              {t('coachRationaleEffectLabel', { defaultValue: 'Expected effect' })}
              {': '}
            </span>
            {t(rationale.effectKey, {
              ...rationale.effectParams,
              defaultValue: rationale.effectDefault,
            })}
          </p>
        </div>
      ) : null}

      {/* Legacy adapt beats — only when structured rationale is absent (should be rare). */}
      {!rationale && visibleBeats.length > 0 ? (
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
      ) : !rationale && beats.length === 0 && whyKeys.length === 0 ? (
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
              // English floors — bootstrap/hydrate must not blank the why panel (.642).
              const line = coachWhyLine(key, t);
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
            {plannedMiss.show ? (
              <>
                <button
                  type="button"
                  data-testid="planned-miss-skip"
                  onClick={() => savePlan(applyPlannedMissSkip(plan, plannedMiss.session.id))}
                  className="inline-flex min-h-[44px] items-center px-3 text-sm text-muted-foreground hover:text-foreground tap-target"
                >
                  {t('plannedMissSkip', { defaultValue: 'Skip' })}
                </button>
                {plannedMiss.canSlide ? (
                  <button
                    type="button"
                    data-testid="planned-miss-slide"
                    onClick={() =>
                      savePlan(
                        applyPlannedMissSlide(plan, plannedMiss.session.id, todayOffset ?? 0)
                      )
                    }
                    className="inline-flex min-h-[44px] items-center px-3 text-sm text-muted-foreground hover:text-foreground tap-target"
                  >
                    {t('plannedMissSlide', { defaultValue: 'Slide' })}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
