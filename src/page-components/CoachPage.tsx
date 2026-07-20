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
import { PlanSessionCard } from '@/components/coach/PlanSessionCard';
import { AdjustSessionSheet } from '@/components/coach/AdjustSessionSheet';
import { UnlockButton } from '@/components/UnlockButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CoachPlanSkeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useCoachPlan } from '@/hooks/useCoachPlan';

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
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const handleRegenerate = () => {
    if (!confirmRegen) {
      setConfirmRegen(true);
      return;
    }
    setConfirmRegen(false);
    generate();
  };

  return (
    <PillarPageShell
      className="max-w-2xl pb-24"
      icon={Sparkles}
      eyebrow={t('coachWeekEyebrow', { defaultValue: "THIS WEEK'S MISSION" })}
      title={t('coachPageTitle', { defaultValue: 'Mission Coach' })}
      subtitle={t('coachPageSubtitle', {
        defaultValue: 'Fatigue-aware weekly plan — one next session, adapted when life happens.',
      })}
    >
      {loading && <CoachPlanSkeleton className="py-2" />}

      {!loading && locked && plan && (
        <div className="space-y-4">
          <p className="eyebrow">{t('coachWeekEyebrow', { defaultValue: "THIS WEEK'S MISSION" })}</p>
          <WeekStrip weekStart={weekStart} sessions={plan.sessions} todayOffset={todayOffset} />
          <p className="text-sm text-muted-foreground text-center">
            {t('coachLockedWeekSummary', {
              done: plan.sessions.filter((s) => s.status === 'done').length,
              total: plan.sessions.length,
              defaultValue: `${plan.sessions.filter((s) => s.status === 'done').length}/${plan.sessions.length} sessions logged last week`,
            })}
          </p>
        </div>
      )}

      {!loading && locked && (
        <Card className="card-elevated card-glow-brass border-brass/30">
          <CardHeader>
            <CardTitle>{t('coachTasterLocked', { defaultValue: 'Your free week is complete' })}</CardTitle>
            <CardDescription>
              {t('coachTasterLockedDesc', {
                defaultValue:
                  'You got one free Coach week. Super Bundle unlocks a new plan every Monday, on-demand regeneration, and Commander\'s intent tuned to readiness.',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground border border-primary/40 rounded-lg p-3 bg-primary/5">
              {t('coachTasterFatigueNote', {
                defaultValue:
                  'Premium also watches strain: when load runs high (≥70), future sessions auto-shift lighter so you recover without quitting the week.',
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
            <p className="text-center text-[11px] text-muted-foreground">
              {t('coachFreeCoreNote', {
                defaultValue: 'Workout logger, library, and Today stay free — premium funds the mission.',
              })}
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !plan && !locked && (
        <EmptyState
          icon={Sparkles}
          title={t('coachGenerateEmptyTitle', { defaultValue: 'No plan this week yet' })}
          description={t('coachTasterDesc', {
            defaultValue:
              'Unlock Mission Coach to regenerate and adapt your plan every week.',
          })}
          actionLabel={t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
          onAction={() => generate()}
        />
      )}

      {plan && !locked && (
        <div className="space-y-6">
          <div>
            <p className="eyebrow mb-3">
              {t('coachWeekEyebrow', { defaultValue: "THIS WEEK'S MISSION" })}
            </p>
            <WeekStrip weekStart={weekStart} sessions={plan.sessions} todayOffset={todayOffset} />
          </div>

          {plan.sessions.some((s) => s.status === 'missed') && (
            <p className="text-sm text-status-warn leading-relaxed rounded-xl border border-status-warn/25 bg-status-warn/5 px-4 py-3">
              {t('coachAdaptMissedNote', {
                count: plan.sessions.filter((s) => s.status === 'missed').length,
                defaultValue:
                  'Missed sessions earlier this week — remaining days re-spread so the plan still fits life.',
              })}
            </p>
          )}

          <CoachVoiceCard plan={plan} bodyScores={ctx.bodyScores} premium={premium} />

          <CoachChatPanel
            premium={premium}
            readiness={ctx.bodyScores.readiness}
            strain={ctx.bodyScores.strain}
            recovery={ctx.bodyScores.recovery}
            todaySession={todaySession}
            askExerciseId={askExerciseId}
          />

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

          {premium && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleRegenerate}
            >
              {confirmRegen
                ? t('coachRegenerateConfirm', { defaultValue: 'Tap again to confirm' })
                : t('coachRegenerate', { defaultValue: 'Regenerate week' })}
            </Button>
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
