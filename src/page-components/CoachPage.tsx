'use client';
/**
 * Page: /coach — Mission Coach weekly plan
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { ScreenDock } from '@/components/layout/ScreenDock';
import { WeekStrip } from '@/components/coach/WeekStrip';
import { CoachLogCite } from '@/components/coach/CoachLogCite';
import { CoachPlanSessionGrid } from '@/components/coach/CoachPlanSessionGrid';
import { AdjustSessionSheet } from '@/components/coach/AdjustSessionSheet';
import { CoachAdaptBanner } from '@/components/coach/CoachAdaptBanner';
import { CoachLoadBand } from '@/components/coach/CoachLoadBand';
import { CoachManageSheet } from '@/components/coach/CoachManageSheet';
import { UnlockButton } from '@/components/UnlockButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CoachPlanSkeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useCoachPlan } from '@/hooks/useCoachPlan';
import { ParqIntakeCard } from '@/components/coach/ParqIntakeCard';
import { summarizeWeekDose } from '@/lib/coach/weekDose';
import { isFreeBeta } from '@/lib/freeBeta';

const CoachVoiceCard = dynamic(
  () => import('@/components/coach/CoachVoiceCard').then((m) => m.CoachVoiceCard),
  { ssr: false, loading: () => <SkeletonCard className="min-h-[6rem]" /> }
);

const CoachChatPanel = dynamic(
  () => import('@/components/coach/CoachChatPanel').then((m) => m.CoachChatPanel),
  { ssr: false, loading: () => <SkeletonCard className="min-h-[5rem]" /> }
);

type CoachPageProps = {
  /** From /coach?ask=<exerciseId> — form Q&A entry (Wave 9). */
  askExerciseId?: string;
};

export function CoachPage({ askExerciseId }: CoachPageProps = {}) {
  const { t } = useTranslation();
  const {
    plan,
    loading,
    premium,
    locked,
    todayOffset,
    weekStart,
    ctx,
    generate,
    needsParq,
    refreshParq,
    todaySession,
    adjustToday,
    swapSessionExercise,
  } = useCoachPlan();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const weekDose = plan ? summarizeWeekDose(plan) : null;
  const doseIntentKey =
    weekDose?.intent === 'strength'
      ? 'coachWeekDoseStrength'
      : weekDose?.intent === 'conditioning'
        ? 'coachWeekDoseConditioning'
        : weekDose?.intent === 'recovery'
          ? 'coachWeekDoseRecovery'
          : 'coachWeekDoseMixed';
  const doseIntentDefault =
    weekDose?.intent === 'strength'
      ? 'mostly strength'
      : weekDose?.intent === 'conditioning'
        ? 'conditioning focus'
        : weekDose?.intent === 'recovery'
          ? 'recovery-heavy'
          : 'mixed strength & recovery';

  const freeBeta = isFreeBeta();
  const weekEyebrow = t('coachWeekEyebrow', { defaultValue: 'This week' });

  return (
    <PillarPageShell
      className="max-w-2xl pb-24"
      icon={Sparkles}
      eyebrow={weekEyebrow}
      title={t('coachPageTitle', { defaultValue: 'Mission Coach' })}
      subtitle={t('coachPageSubtitle', {
        defaultValue:
          'A week of training built from your logs — no wearable. Miss a day or crush a PR, and the plan flexes.',
      })}
    >
      {/*
       * Directly under the subtitle's "built from your logs" claim, before any
       * plan renders: the log it is built from, or the fact that there is none.
       * `emphasis` because on this screen the citation *is* the argument — the
       * survey's lowest-scoring item was clarity about exactly this.
       */}
      <CoachLogCite emphasis className="mb-3" />

      {loading && <CoachPlanSkeleton className="py-2" />}

      {!loading && locked && plan && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-muted-foreground">{weekEyebrow}</p>
          <WeekStrip weekStart={weekStart} sessions={plan.sessions} todayOffset={todayOffset} />
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            {t('coachLockedWeekSummary', {
              done: plan.sessions.filter((s) => s.status === 'done').length,
              total: plan.sessions.length,
              defaultValue: `${plan.sessions.filter((s) => s.status === 'done').length}/${plan.sessions.length} sessions logged last week`,
            })}
          </p>
        </div>
      )}

      {/* Free beta: never hard-lock Coach — offer a fresh week.
          Invite only in EmptyState; one red Generate lives in ScreenDock (1A). */}
      {!loading && locked && freeBeta && needsParq && (
        <ParqIntakeCard
          onDone={() => {
            refreshParq();
            generate();
          }}
        />
      )}
      {!loading && locked && freeBeta && !needsParq && (
        <>
          <EmptyState
            icon={Sparkles}
            title={t('coachGenerateEmptyTitle', { defaultValue: 'Ready for a new week?' })}
            description={t('coachFreeBetaNextWeek', {
              defaultValue: 'Generate next week from your latest logs. Free while beta is open.',
            })}
          />
          <ScreenDock>
            <div className="poster-field px-4 pb-4 pt-3.5">
              <p className="poster-kicker mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
                {weekEyebrow}
              </p>
              <p className="poster-sub mb-2.5 line-clamp-2 text-sm leading-relaxed">
                {t('coachFreeBetaNextWeek', {
                  defaultValue: 'Generate next week from your latest logs. Free while beta is open.',
                })}
              </p>
              <button
                type="button"
                onClick={() => generate()}
                className="primary-action min-h-[52px] w-full text-[19px]"
              >
                <span className="flex-1 text-start">
                  {t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
                </span>
                <ChevronRight className="ms-auto h-5 w-5 shrink-0" aria-hidden />
              </button>
            </div>
          </ScreenDock>
        </>
      )}

      {!loading && locked && !freeBeta && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">
              {t('coachTasterLocked', { defaultValue: 'Your free week is complete' })}
            </CardTitle>
            <CardDescription className="leading-relaxed">
              {t('coachTasterLockedDesc', {
                defaultValue:
                  'You got one free Coach week. Super Bundle unlocks a new plan every Monday, on-demand regeneration, and readiness-aware intent.',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground border-2 border-border p-3 leading-relaxed">
              {t('coachTasterFatigueNote', {
                defaultValue:
                  'Premium also watches strain: when load runs high, later sessions ease up so you recover without quitting the week.',
              })}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {(['coachLockedBenefit1', 'coachLockedBenefit2', 'coachLockedBenefit3', 'coachLockedBenefit4'] as const).map(
                (key) => (
                  <li key={key} className="flex gap-2">
                    <span className="text-primary shrink-0">✓</span>
                    <span>{t(key)}</span>
                  </li>
                )
              )}
            </ul>
            <UnlockButton productId="super-bundle" planId="12mo" price="59" title="Super Bundle" isSubscription />
            <Button asChild variant="outline" className="w-full min-h-[44px] tap-target">
              <Link href="/bundle">{t('coachCompareBundle', { defaultValue: 'Compare Super Bundle' })}</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              {t('coachFreeCoreNote', {
                defaultValue: 'Workout logger, library, and Today stay free forever.',
              })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Field manual 1A: EmptyState is invite only (outline CTAs demoted by design).
          Boss Generate docks in poster-field — same chrome as Active empty Start. */}
      {!loading && !plan && !locked && needsParq && (
        <ParqIntakeCard
          onDone={() => {
            refreshParq();
            generate();
          }}
        />
      )}
      {!loading && !plan && !locked && !needsParq && (
        <>
          <EmptyState
            icon={Sparkles}
            title={t('coachGenerateEmptyTitle', { defaultValue: 'No plan this week' })}
            description={t('coachGenerateEmptyDesc', {
              defaultValue: freeBeta
                ? 'One week from your logs. Free every week — no wearable.'
                : 'One week from your logs. Free every week; Bundle adds chat and regenerate.',
            })}
          />
          <ScreenDock>
            <div className="poster-field px-4 pb-4 pt-3.5">
              <p className="poster-kicker mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
                {weekEyebrow}
              </p>
              <p className="poster-sub mb-2.5 line-clamp-2 text-sm leading-relaxed">
                {t('coachGenerateEmptyDesc', {
                  defaultValue: freeBeta
                    ? 'One week from your logs. Free every week — no wearable.'
                    : 'One week from your logs. Free every week; Bundle adds chat and regenerate.',
                })}
              </p>
              <button
                type="button"
                onClick={() => generate()}
                className="primary-action min-h-[52px] w-full text-[19px]"
                data-testid="coach-generate-dock"
              >
                <span className="flex-1 text-start">
                  {t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
                </span>
                <ChevronRight className="ms-auto h-5 w-5 shrink-0" aria-hidden />
              </button>
            </div>
          </ScreenDock>
        </>
      )}

      {plan && !locked && (
        <div className="space-y-5">
          {/* Field manual: week + adapt first; voice/load/chat secondary. */}
          <div>
            <p className="eyebrow mb-3 text-primary">{weekEyebrow}</p>
            <WeekStrip weekStart={weekStart} sessions={plan.sessions} todayOffset={todayOffset} />
            {weekDose && weekDose.sessionCount > 0 && (
              <p className="mt-3 text-sm text-muted-foreground" data-testid="coach-week-dose">
                {t('coachWeekDose', {
                  count: weekDose.sessionCount,
                  intent: t(doseIntentKey, { defaultValue: doseIntentDefault }),
                  minutes: weekDose.estMinutes,
                  defaultValue: `This week’s dose: ${weekDose.sessionCount} sessions · ${doseIntentDefault} · ~${weekDose.estMinutes} min`,
                })}
              </p>
            )}
          </div>

          <CoachAdaptBanner
            plan={plan}
            todayOffset={todayOffset}
            showWeekRationale
            rationaleHints={{
              loggedWorkoutCount: ctx.history.length,
              loadZone: ctx.loadZone ?? null,
            }}
            onAdjustToday={
              todaySession && todaySession.status !== 'done'
                ? () => setAdjustOpen(true)
                : undefined
            }
          />

          {/* Form deep-link (?ask=): show free cues / chat near top */}
          {askExerciseId ? (
            <div id="coach-chat">
              <CoachChatPanel
                premium={premium}
                readiness={ctx.bodyScores.readiness}
                strain={ctx.bodyScores.strain}
                recovery={ctx.bodyScores.recovery}
                todaySession={todaySession}
                askExerciseId={askExerciseId}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="min-h-[44px] text-sm text-muted-foreground hover:text-foreground hover:underline"
              onClick={() => setManageOpen(true)}
            >
              {t('coachManageWeek', { defaultValue: 'Manage this week' })}
            </button>
            {todaySession && todaySession.status !== 'done' && !adjustOpen ? (
              <button
                type="button"
                className="min-h-[44px] text-sm text-muted-foreground hover:underline"
                onClick={() => setAdjustOpen(true)}
              >
                {t('coachAdjustToday', { defaultValue: 'Adjust today' })}
              </button>
            ) : null}
          </div>

          <AdjustSessionSheet
            open={adjustOpen}
            onClose={() => setAdjustOpen(false)}
            onAdjust={(c) => {
              adjustToday(c);
            }}
          />

          <CoachManageSheet
            open={manageOpen}
            onClose={() => setManageOpen(false)}
            canAdjustToday={!!todaySession && todaySession.status !== 'done'}
            onAdjustToday={() => setAdjustOpen(true)}
            canRegenerate={premium}
            onRegenerate={() => generate()}
          />

          <CoachPlanSessionGrid
            sessions={plan.sessions}
            todayOffset={todayOffset}
            onAdjustToday={() => setAdjustOpen(true)}
            onSwapExercise={swapSessionExercise}
            rationaleHints={{
              loggedWorkoutCount: ctx.history.length,
              loadZone: ctx.loadZone ?? null,
            }}
          />

          <details className="group border-2 border-border bg-card">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              {t('coachMoreDepth', { defaultValue: 'Voice, load & chat' })}
            </summary>
            <div className="space-y-4 border-t-2 border-border p-4">
              <CoachVoiceCard plan={plan} bodyScores={ctx.bodyScores} premium={premium} />
              <CoachLoadBand />
              {!askExerciseId ? (
                <div id="coach-chat">
                  <CoachChatPanel
                    premium={premium}
                    readiness={ctx.bodyScores.readiness}
                    strain={ctx.bodyScores.strain}
                    recovery={ctx.bodyScores.recovery}
                    todaySession={todaySession}
                  />
                </div>
              ) : null}
            </div>
          </details>
        </div>
      )}

      {todaySession && (
        <p className="text-xs text-center text-muted-foreground">
          <Link href="/log" className="text-primary hover:underline min-h-[44px] inline-flex items-center tap-target">
            {t('navToday', { defaultValue: 'Today' })}
          </Link>
        </p>
      )}
    </PillarPageShell>
  );
}
