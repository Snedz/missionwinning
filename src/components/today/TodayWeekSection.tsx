'use client';

import { Dumbbell, Flame, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { getChallengeProgress } from '@/lib/challenges';
import type { TodaysWorkout } from '@/lib/todaysWorkout';

type Props = {
  challenges: ReturnType<typeof getChallengeProgress>;
  streak: number;
  todaysWorkout: TodaysWorkout;
  onStartTodaysWorkout: () => void;
};

export function TodayWeekSection({ challenges, streak, todaysWorkout, onStartTodaysWorkout }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pt-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" />
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
          {challenges.map((c) => (
            <div key={c.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{c.title}</span>
                <span className="text-muted-foreground">
                  {c.current}/{c.target}
                </span>
              </div>
              <div className="h-2 bg-muted rounded overflow-hidden">
                <div
                  className="h-2 bg-emerald-500 rounded transition-all"
                  style={{ width: `${c.percent}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">{c.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            {todaysWorkout.name}
            <span className="text-xs font-normal px-2 py-0.5 rounded bg-primary/20 text-primary">
              {todaysWorkout.tag}
            </span>
          </CardTitle>
          <CardDescription>{todaysWorkout.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="fitness" onClick={onStartTodaysWorkout}>
            <Play className="h-4 w-4 mr-2" />
            {t('todayStartWorkout', { defaultValue: "Start Today's Workout" })}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
