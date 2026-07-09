'use client';
/**
 * Page: /coach — Mission Coach weekly plan
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { WeekStrip } from '@/components/coach/WeekStrip';
import { PlanSessionCard } from '@/components/coach/PlanSessionCard';
import { CoachVoiceCard } from '@/components/coach/CoachVoiceCard';
import { UnlockButton } from '@/components/UnlockButton';
import { useCoachPlan } from '@/hooks/useCoachPlan';

export function CoachPage() {
  const { t } = useTranslation();
  const { plan, loading, premium, locked, todayOffset, weekStart, ctx, generate, todaySession } =
    useCoachPlan();
  const [confirmRegen, setConfirmRegen] = useState(false);

  const handleRegenerate = () => {
    if (!confirmRegen) {
      setConfirmRegen(true);
      return;
    }
    setConfirmRegen(false);
    generate();
  };

  return (
    <div className="page-stack max-w-2xl mx-auto pb-24">
      <PillarPageHeader
        title={t('coachPageTitle', { defaultValue: 'Mission Coach' })}
        icon={Sparkles}
        subtitle={t('coachWeekEyebrow', { defaultValue: "THIS WEEK'S MISSION" })}
      />

      {loading && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t('coachVoiceLoading', { defaultValue: 'Briefing your week…' })}
        </p>
      )}

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
        <Card className="content-card border-emerald-500/20">
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
            <p className="text-sm text-muted-foreground border border-emerald-500/15 rounded-lg p-3 bg-emerald-500/5">
              {t('coachTasterFatigueNote', {
                defaultValue:
                  'Premium also watches strain: when load runs high (≥70), future sessions auto-shift lighter so you recover without quitting the week.',
              })}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {(['coachLockedBenefit1', 'coachLockedBenefit2', 'coachLockedBenefit3', 'coachLockedBenefit4'] as const).map(
                (key) => (
                  <li key={key} className="flex gap-2">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span>{t(key)}</span>
                  </li>
                )
              )}
            </ul>
            <UnlockButton productId="super-bundle" price="59" title="Super Bundle" isSubscription />
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
        <Card className="content-card">
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('coachTasterDesc', {
                defaultValue:
                  'Unlock Mission Coach to regenerate and adapt your plan every week.',
              })}
            </p>
            <Button variant="fitness" className="w-full" onClick={() => generate()}>
              {t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
            </Button>
          </CardContent>
        </Card>
      )}

      {plan && !locked && (
        <div className="space-y-6">
          <div>
            <p className="eyebrow mb-3">
              {t('coachWeekEyebrow', { defaultValue: "THIS WEEK'S MISSION" })}
            </p>
            <WeekStrip weekStart={weekStart} sessions={plan.sessions} todayOffset={todayOffset} />
          </div>

          <CoachVoiceCard plan={plan} bodyScores={ctx.bodyScores} premium={premium} />

          <div className="space-y-4">
            {plan.sessions
              .slice()
              .sort((a, b) => a.dayOffset - b.dayOffset)
              .map((session) => (
                <PlanSessionCard key={session.id} session={session} />
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
          <Link href="/log" className="text-emerald-400 hover:underline">
            ← {t('navToday', { defaultValue: 'Today' })}
          </Link>
        </p>
      )}
    </div>
  );
}
