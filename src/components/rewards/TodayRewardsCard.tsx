'use client';

import { Medal, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RewardsSummary } from '@/lib/rewards/summary';

type Props = {
  summary: RewardsSummary;
};

/** Today glance: rank bar + weekly train goal (boss consistency signal). */
export function TodayRewardsCard({ summary }: Props) {
  const { t } = useTranslation();
  const rankTitle = t(summary.rankTitleKey, { defaultValue: summary.rankTitleDefault });

  return (
    <Card className="content-card" data-testid="today-rewards-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Medal className="h-5 w-5 text-primary" aria-hidden />
          {t('rewardTodayTitle', { defaultValue: 'Mission progress' })}
        </CardTitle>
        <CardDescription>
          {t('rewardTodayRank', {
            level: summary.level,
            rank: rankTitle,
            defaultValue: `Level ${summary.level} · ${rankTitle}`,
          })}
          {summary.xpTotal > 0
            ? t('rewardTodayXpTotal', {
                xp: summary.xpTotal,
                defaultValue: ` · ${summary.xpTotal} XP`,
              })
            : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('rewardLevelBar', { defaultValue: 'Next level' })}</span>
            <span>
              {summary.levelInto}/{summary.levelNeed}
            </span>
          </div>
          <div className="h-2 bg-muted overflow-hidden border-2 border-border" role="progressbar" aria-valuenow={Math.round(summary.levelRatio * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={t('rewardLevelBar', { defaultValue: 'Next level' })}>
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.round(summary.levelRatio * 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium flex items-center gap-1.5">
              <Target className="h-4 w-4 text-primary" aria-hidden />
              {t('rewardWeeklyGoal', { defaultValue: 'Weekly train goal' })}
            </span>
            <span className="text-muted-foreground">
              {summary.weeklyTrainCurrent}/{summary.weeklyTrainGoal}
            </span>
          </div>
          <div className="h-2 bg-muted overflow-hidden border-2 border-border" role="progressbar" aria-valuenow={summary.weeklyTrainPercent} aria-valuemin={0} aria-valuemax={100} aria-label={t('rewardWeeklyGoal', { defaultValue: 'Weekly train goal' })}>
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${summary.weeklyTrainPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {t('rewardWeeklyGoalHint', {
              defaultValue: 'Hit your weekly sessions — rest days are part of the plan.',
            })}
          </p>
        </div>

        {summary.challengesTotal > 0 ? (
          <p className="text-xs text-muted-foreground" data-testid="today-rewards-challenges">
            {t('rewardProfileChallenges', {
              done: summary.challengesComplete,
              total: summary.challengesTotal,
              defaultValue: `${summary.challengesComplete}/${summary.challengesTotal} weekly challenges met`,
            })}
          </p>
        ) : null}

        {summary.badges.length > 0 ? (
          <p className="text-xs text-muted-foreground" data-testid="today-rewards-badges">
            {t('rewardBadgeCount', {
              // Locale packs use {{n}} (not {{count}}) — both supplied so neither path paints raw.
              n: summary.badges.length,
              count: summary.badges.length,
              defaultValue: `${summary.badges.length} badges earned`,
            })}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
