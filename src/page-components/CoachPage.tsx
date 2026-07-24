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
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { WeekStrip } from '@/components/coach/WeekStrip';
import { PlanSessionCard } from '@/components/coach/PlanSessionCard';
import { AdjustSessionSheet } from '@/components/coach/AdjustSessionSheet';
import { CoachAdaptBanner } from '@/components/coach/CoachAdaptBanner';
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
          <p className="text-sm font-medium text-muted-foreground">{weekEyebrow}</p>
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
            defaultValue:
              'Open beta keeps Coach open. Generate the next week from your latest logs — no payment.',
          })}
          actionLabel={t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
          onAction={() => generate()}
        />
      )}

      {!loading && locked && !freeBeta && (
        <Card className="border-border/50 bg-card/80 shadow-sm">
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
            <p className="text-sm text-muted-foreground border border-border/50 rounded-xl p-3 leading-relaxed">
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
          title={t('coachGenerateEmptyTitle', { defaultValue: 'No plan this week yet' })}
          description={t('coachGenerateEmptyDesc', {
            defaultValue: freeBeta
              ? 'Generate this week’s plan from your logs — free every week.'
              : 'Generate this week’s plan from your logs — free every week. Super Bundle unlocks chat and on-demand regenerate.',
          })}
          actionLabel={t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
          onAction={() => generate()}
        />
      )}

      {plan && !locked && (
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">{weekEyebrow}</p>
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

          <CoachAdaptBanner plan={plan} />

          <CoachVoiceCard plan={plan} bodyScores={ctx.bodyScores} premium={premium} />

          {/* Form deep-link (?ask=): show free cues / chat near top */}
          {askExerciseId ? (
            <CoachChatPanel
              premium={premium}
              readiness={ctx.bodyScores.readiness}
              strain={ctx.bodyScores.strain}
              recovery={ctx.bodyScores.recovery}
              todaySession={todaySession}
              askExerciseId={askExerciseId}
            />
          ) : null}

          {todaySession && todaySession.status !== 'done' && (
            <div className="space-y-2">
              {!adjustOpen ? (
                <button
                  type="button"
                  className="text-sm text-primary min-h-[44px] hover:underline"
                  onClick={() => setAdjustOpen(true)}
                >
                  {t('coachAdjustToday', { defaultValue: 'Adjust today' })}
                </button>
              ) : null}
              <AdjustSessionSheet
                open={adjustOpen}
                onClose={() => setAdjustOpen(false)}
                onAdjust={(c) => {
                  adjustToday(c);
                }}
              />
            </div>
          )}

          {/* Free Coach hero: week sessions before any Bundle upsell */}
          <div className="space-y-4">
            {plan.sessions
              .slice()
              .sort((a, b) => a.dayOffset - b.dayOffset)
              .map((session) => (
                <PlanSessionCard
                  key={session.id}
                  session={session}
                  onAdjust={
                    session.dayOffset === todayOffset && session.status !== 'done'
                      ? () => setAdjustOpen(true)
                      : undefined
                  }
                />
              ))}
          </div>

          {!askExerciseId ? (
            <CoachChatPanel
              premium={premium}
              readiness={ctx.bodyScores.readiness}
              strain={ctx.bodyScores.strain}
              recovery={ctx.bodyScores.recovery}
              todaySession={todaySession}
            />
          ) : null}
          {premium && (
            <HoldToConfirmButton
              variant="destructive"
              className="w-full"
              label={t('coachRegenerateWeekPlan', {
                defaultValue: 'Regenerate week plan',
              })}
              onConfirm={() => generate()}
            />
          )}
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
