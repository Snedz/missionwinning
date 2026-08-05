'use client';
/**
 * Page: /coach — Mission Coach weekly plan
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { WeekStrip } from '@/components/coach/WeekStrip';
import { CoachPlanSessionGrid } from '@/components/coach/CoachPlanSessionGrid';
import { AdjustSessionSheet } from '@/components/coach/AdjustSessionSheet';
import { CoachAdaptBanner } from '@/components/coach/CoachAdaptBanner';
import { CoachManageSheet } from '@/components/coach/CoachManageSheet';
import { UnlockButton } from '@/components/UnlockButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CoachPlanSkeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useCoachPlan } from '@/hooks/useCoachPlan';
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
    todaySession,
    adjustToday,
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

      {/* Free beta: never hard-lock Coach — offer a fresh week */}
      {!loading && locked && freeBeta && (
        <EmptyState
          icon={Sparkles}
          title={t('coachGenerateEmptyTitle', { defaultValue: 'Ready for a new week?' })}
          description={t('coachFreeBetaNextWeek', {
            defaultValue: 'Generate next week from your latest logs. Free while beta is open.',
          })}
          actionLabel={t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
          onAction={() => generate()}
        />
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
            <Button asChild variant="outline" className="w-full">
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

      {!loading && !plan && !locked && (
        <EmptyState
          icon={Sparkles}
          title={t('coachGenerateEmptyTitle', { defaultValue: 'No plan this week' })}
          description={t('coachGenerateEmptyDesc', {
            defaultValue: freeBeta
              ? 'One week from your logs. Free every week — no wearable.'
              : 'One week from your logs. Free every week; Bundle adds chat and regenerate.',
          })}
          actionLabel={t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
          onAction={() => generate()}
        />
      )}

      {plan && !locked && (
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-semibold text-muted-foreground">{weekEyebrow}</p>
            <WeekStrip weekStart={weekStart} sessions={plan.sessions} todayOffset={todayOffset} />
            {weekDose && weekDose.sessionCount > 0 && (
              <p className="mt-3 text-center text-sm text-muted-foreground" data-testid="coach-week-dose">
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
            onAdjustToday={
              todaySession && todaySession.status !== 'done'
                ? () => setAdjustOpen(true)
                : undefined
            }
          />

          <CoachVoiceCard plan={plan} bodyScores={ctx.bodyScores} premium={premium} />

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
              className="text-sm text-primary min-h-[44px] hover:underline"
              onClick={() => setManageOpen(true)}
            >
              {t('coachManageWeek', { defaultValue: 'Manage this week' })}
            </button>
            {todaySession && todaySession.status !== 'done' && !adjustOpen ? (
              <button
                type="button"
                className="text-sm text-muted-foreground min-h-[44px] hover:underline"
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

          {/* Free Coach hero: week sessions before any Bundle upsell.
              Two columns from sm up, per the handoff — a week of sessions is a
              grid you scan, not a stack you scroll. */}
          <CoachPlanSessionGrid
            sessions={plan.sessions}
            todayOffset={todayOffset}
            onAdjustToday={() => setAdjustOpen(true)}
          />

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
          {/*
            Regenerate stays in Manage sheet as the hold-confirm path.
            Keeping a second red/destructive on the page fought the one-red rule.
            Premium athletes still reach it via Manage → Regenerate.
          */}
        </div>
      )}

      {todaySession && (
        <p className="text-xs text-center text-muted-foreground">
          <Link href="/log" className="text-primary hover:underline">
            ← {t('navToday', { defaultValue: 'Today' })}
          </Link>
        </p>
      )}
    </PillarPageShell>
  );
}
