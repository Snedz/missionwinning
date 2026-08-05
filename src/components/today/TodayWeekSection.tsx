'use client';

import { Dumbbell, Flame, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { getChallengeProgress } from '@/lib/challenges';
import { localizedChallengeDesc, localizedChallengeTitle } from '@/lib/challengeI18n';
import type { TodaysWorkout } from '@/lib/todaysWorkout';
import { Check } from 'lucide-react';
import type { RewardsSummary } from '@/lib/rewards/summary';
import { TodayRewardsCard } from '@/components/rewards/TodayRewardsCard';

type Props = {
  challenges: ReturnType<typeof getChallengeProgress>;
  streak: number;
  todaysWorkout: TodaysWorkout;
  onStartTodaysWorkout: () => void;
  rewards?: RewardsSummary | null;
};

export function TodayWeekSection({
  challenges,
  streak,
  todaysWorkout,
  onStartTodaysWorkout,
  rewards,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pt-2">
      {rewards ? <TodayRewardsCard summary={rewards} /> : null}

      <Card className="content-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            {t('todayWeeklyChallenges', { defaultValue: 'Weekly Challenges' })}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              🔥 {t('todayDayStreak', { count: streak, defaultValue: `${streak}-day streak` })}
            </span>
          </CardTitle>
          <CardDescription>
            {t('todayWeeklyChallengesDesc', {
              defaultValue: 'Train + Fuel + volume goals this week. Free core — no premium required.',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {challenges.map((c) => {
            const done = c.current >= c.target;
            return (
              <div key={c.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium flex items-center gap-1">
                    {done ? <Check className="h-3.5 w-3.5 text-primary" aria-hidden /> : null}
                    {localizedChallengeTitle(c.id, c.title, t)}
                  </span>
                  <span className="text-muted-foreground">
                    {done
                      ? t('rewardChallengeDone', { defaultValue: 'Done' })
                      : `${c.current}/${c.target}`}
                  </span>
                </div>
                <div className="h-2 bg-muted overflow-hidden border-2 border-border">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${c.percent}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {localizedChallengeDesc(c.id, c.description, t)}
                  {done
                    ? t('rewardChallengeXpHint', {
                        defaultValue: ' · +75 XP earned',
                      })
                    : null}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="content-card border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            {todaysWorkout.name}
            <span className="text-xs font-normal border-2 border-border bg-card px-2 py-0.5 text-foreground">
              {todaysWorkout.tag}
            </span>
          </CardTitle>
          <CardDescription>{todaysWorkout.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* `outline`, not `fitness`. Today docks exactly one red action in
              `ScreenDock`; this card lives inside the "Today details"
              disclosure, and a second red fill in `main` is the competing-CTA
              failure the quality bar names. `redActions.ts` allows zero red
              controls in `main` — it never caught this because the disclosure
              only mounts from `readiness` up, and the hero e2e stops earlier. */}
          <Button variant="outline" onClick={onStartTodaysWorkout}>
            <Play className="h-4 w-4 mr-2" />
            {t('todayStartWorkout', { defaultValue: "Start Today's Workout" })}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
