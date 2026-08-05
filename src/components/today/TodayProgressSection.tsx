'use client';

import { useRouter } from 'next/navigation';
import {
  Check,
  Circle,
  Clock,
  Dumbbell,
  Flame,
  Medal,
  Moon,
  Sunrise,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { Button } from '@/components/ui/button';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EXERCISES } from '@/data/exercises';
import { FREE_STARTER_PROGRAMS } from '@/data/starterPrograms';
import { formatDuration } from '@/lib/utils';
import { MAJOR_GROUPS } from '@/lib/muscleGroups';
import { getUser, getUserNutritionForDate, type CloudNutritionEntry } from '@/lib/supabase';
import { enqueueNutritionUpsert } from '@/lib/sync/nutritionSync';
import { muscleGroupLabel } from '@/lib/readinessDisplay';
import type { computeReadiness } from '@/lib/score';
import type { CompletedWorkoutLog, SavedWorkout, WorkoutExerciseTemplate } from '@/types';
import { useWorkoutStore } from '@/store/workoutStore';
import { SHOW_TODAY_FOUNDER_TOOLS } from '@/lib/todayFounderTools';
import { StreakChip } from '@/components/today/StreakChip';
import { bumpTrainingStreak } from '@/lib/streaks';
import { toast } from '@/hooks/use-toast';
import { localDateKey } from '@/lib/time/localDate';

type MwWindow = Window & {
  triggerPwaInstall?: () => Promise<void>;
  deferredPwaPrompt?: () => { prompt: () => void } | null;
};

export type TodayProgressSectionProps = {
  savedWorkouts: SavedWorkout[];
  readiness: ReturnType<typeof computeReadiness>;
  userGoalDisplay: string;
  userEquip: string;
  totalSessions: number;
  totalVolume: number;
  streak: number;
  highProteinDays: number;
  nightSessions: number;
  dawnSessions: number;
  lastAssessment: { risk?: string; date?: string } | null;
  recentPillarWins: { name?: string; date?: string }[];
  setRecentPillarWins: React.Dispatch<React.SetStateAction<{ name?: string; date?: string }[]>>;
  recent: CompletedWorkoutLog[];
  onStartStarter: (name: string, exercises: WorkoutExerciseTemplate[]) => void;
};

export function TodayProgressSection({
  savedWorkouts,
  readiness,
  userGoalDisplay,
  userEquip,
  totalSessions,
  totalVolume,
  streak,
  highProteinDays,
  nightSessions,
  dawnSessions,
  lastAssessment,
  recentPillarWins,
  setRecentPillarWins,
  recent,
  onStartStarter,
}: TodayProgressSectionProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const freeStarters = FREE_STARTER_PROGRAMS;

  const handleStartSaved = (id: string) => {
    const workout = savedWorkouts.find((w) => w.id === id);
    if (!workout) return;
    startWorkout(workout.name, workout.exercises, workout.id);
    router.push('/active');
  };

  return (
      <div className="space-y-4 pt-2">
      {/* Free starters + saved routines — secondary to Journey hero */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('todayQuickOptions', { defaultValue: 'Quick options' })}</CardTitle>
          <CardDescription>{t('todayQuickOptionsDesc', { defaultValue: 'Free starter programs and saved routines.' })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {freeStarters.slice(0, 6).map((s, i) => (
              <Button key={i} variant="outline" size="sm" onClick={() => onStartStarter(s.name, s.exercises)}>
                {s.name}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {savedWorkouts.slice(0, 3).map((w) => (
              <Button key={w.id} variant="outline" size="sm" onClick={() => handleStartSaved(w.id)}>
                {w.name}
              </Button>
            ))}
            {savedWorkouts.length === 0 && (
              <Button variant="ghost" size="sm" onClick={() => router.push('/builder')}>
                {t('todayBuildCustom', { defaultValue: 'Build a custom session →' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Muscle Readiness (Forge-style actionable "know what to train" — inferred from your logs) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> {t('todayMuscleReadiness', { defaultValue: 'Muscle Readiness' })}
          </CardTitle>
          <CardDescription>{t('todayMuscleReadinessDesc', { defaultValue: 'Based on your recent training history. Prime groups are ready for focus.' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {MAJOR_GROUPS.map(g => {
              const r = readiness[g];
              const isPrime = r.days >= 4;
              const groupLabel = muscleGroupLabel(g, t);
              const matchingEx = EXERCISES.filter(e => e.muscleGroups.includes(g)).slice(0, 2);
              return (
                <div key={g} className={`p-3 border-2 ${isPrime ? 'border-primary bg-tint' : 'border-border bg-card'}`}>
                  <div className="font-medium">{groupLabel}</div>
                  <div className={isPrime ? "text-primary" : "text-muted-foreground"}>
                    {r.days === 99
                      ? t('todayNoRecentData', { defaultValue: 'No recent data' })
                      : `${t('todayDaysRest', { days: r.days, defaultValue: `${r.days}d rest` })} — ${t(r.statusKey, { defaultValue: r.statusKey })}`}
                  </div>
                  {isPrime && matchingEx.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 text-xs w-full"
                      onClick={() => {
                        const template = matchingEx.map(ex => ({ exerciseId: ex.id, sets: [{ reps: 8, weight: 0 }] }));
                        startWorkout(`${groupLabel} Focus`, template);
                        router.push("/active");
                      }}
                    >
                      {t('todayTrainGroup', { group: groupLabel, defaultValue: `Train ${groupLabel} now →` })}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">{t('todayMuscleReadinessFoot', { defaultValue: 'Train prime groups for best results. Rest others. Your logs make this smarter over time.' })}</div>
        </CardContent>
      </Card>

      {/* Recommended starting point - tied to onboarding for clear progression */}
      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> {t('todayRecommendedStart', { defaultValue: 'Recommended Starting Point' })}
          </CardTitle>
          <CardDescription>{t('todayRecommendedStartDesc', { defaultValue: 'Based on your mission setup (edit in Profile).' })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="font-medium">{t('todayFocusLabel', { defaultValue: 'Focus:' })}</span> {userGoalDisplay}{' '}
            {userEquip === 'bodyweight'
              ? t('todayWithBodyweight', { defaultValue: 'with bodyweight/minimal' })
              : t('todayWithEquipment', { defaultValue: 'with available equipment' })}
          </div>
          <div className="text-muted-foreground">{t('todayRecommendedBody', { defaultValue: 'Start with a simple full-body or split from Builder, or launch a program template. Complete sessions to level up your Win Score.' })}</div>
          <Button variant="outline" size="sm" onClick={() => router.push('/builder')}>
            {t('todayGoBuilder', { defaultValue: 'Go to Builder / Choose Template →' })}
          </Button>
        </CardContent>
      </Card>

      {/* Stats row (supporting, not the hero) */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-2 border-border bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              {t('todayStatSessions', { defaultValue: 'Sessions' })}
            </CardDescription>
            <CardTitle className="text-3xl">{totalSessions}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 border-border bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              {t('todayStatVolume', { defaultValue: 'Total Volume' })}
            </CardDescription>
            <CardTitle className="text-3xl">
              {fmt.num(totalVolume)}{' '}
              <span className="text-lg font-normal text-muted-foreground">{unitLabel}</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 border-border bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              {t('todayStatSaved', { defaultValue: 'Saved Routines' })}
            </CardDescription>
            <CardTitle className="text-3xl">{savedWorkouts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 border-border bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              {t('todayStatStreak', { defaultValue: 'Current Streak' })}
            </CardDescription>
            <CardTitle className="text-3xl">
              <StreakChip streak={streak} variant="stat" />
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Last Assessment + Recent Pillar Wins (cloud loaded) - free core visibility + functional */}
        <Card className="border-2 border-border bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" /> {t('todayAssessmentCardTitle', { defaultValue: 'Last Assessment & Recent Pillar Wins' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            {lastAssessment ? (
              <div>
                {t('todayAssessmentLast', {
                  risk: lastAssessment.risk?.toUpperCase() ?? '',
                  date: lastAssessment.date ?? '',
                  defaultValue: `Last: ${lastAssessment.risk} risk (${lastAssessment.date})`,
                })}{' '}
                •{' '}
                <a href="/assessments" className="underline">
                  {t('todayAssessmentRetake', { defaultValue: 'Retake' })}
                </a>
              </div>
            ) : (
              <div>
                {t('todayAssessmentNone', { defaultValue: 'No assessment yet.' })}{' '}
                <a href="/assessments" className="underline">
                  {t('todayAssessmentTake', { defaultValue: 'Take free Readiness Assessment →' })}
                </a>
              </div>
            )}

            {recentPillarWins.length > 0 ? (
              <div>
                {t('todayRecentPillarWinsLabel', { defaultValue: 'Recent pillar wins:' })}
                <ul className="list-disc pl-4 mt-1">
                  {recentPillarWins.map((w, i) => <li key={i}>{w.name} {w.date && `(${w.date})`}</li>)}
                </ul>
                <a href="/nutrition" className="underline">
                  {t('todaySeeNutritionLink', { defaultValue: 'See full in Nutrition →' })}
                </a>
              </div>
            ) : (
              <div>{t('todayPillarWinEmpty', { defaultValue: 'Log wins from Move or Mind (saves to cloud when signed in).' })}</div>
            )}

            {SHOW_TODAY_FOUNDER_TOOLS && (
              <>
            <Button size="sm" variant="ghost" className="text-xs mt-1" onClick={async () => {
              try {
                const u = await getUser();
                const today = localDateKey();
                if (u) enqueueNutritionUpsert({ date: today, name: 'Daily Pillar Win (quick log)', protein: 0, cals: 0 });
                const current = bumpTrainingStreak();
                setRecentPillarWins(prev => [{name: 'Daily Pillar Win (quick log)', date: today}, ...prev].slice(0,5));
                alert(`Daily win logged! +1 streak (${current}). ${u ? 'Saved to cloud.' : 'Sign in for cloud sync.'}`);
              } catch { /* noop */ }
            }}>Log Daily Pillar Win (+streak + cloud)</Button>
            <Button size="sm" variant="ghost" className="text-xs mt-1" onClick={async () => {
              try {
                const u = await getUser();
                const today = localDateKey();
                if (u) enqueueNutritionUpsert({ date: today, name: 'Quick Mind Win from Home', protein: 0, cals: 0 });
                const current = bumpTrainingStreak();
                setRecentPillarWins(prev => [{name: 'Quick Mind Win from Home', date: today}, ...prev].slice(0,5));
                alert(`Mind win logged! +1 streak (${current}). ${u ? 'Cloud saved.' : ''}`);
              } catch { /* noop */ }
            }}>Log Mind Win (+streak + cloud)</Button>
            <Button size="sm" variant="ghost" className="text-xs mt-1" onClick={async () => {
              try {
                const u = await getUser();
                const today = localDateKey();
                if (u) enqueueNutritionUpsert({ date: today, name: 'Quick Move Win from Home', protein: 0, cals: 0 });
                const current = bumpTrainingStreak();
                setRecentPillarWins(prev => [{name: 'Quick Move Win from Home', date: today}, ...prev].slice(0,5));
                alert(`Move win logged! +1 streak (${current}). ${u ? 'Cloud saved.' : ''}`);
              } catch { /* noop */ }
            }}>Log Move Win (+streak + cloud)</Button>
            <Button size="sm" variant="outline" className="text-xs mt-1" onClick={async () => {
              try {
                const u = await getUser();
                if (u) {
                  const today = localDateKey();
                  const cloud = await getUserNutritionForDate(today);
                  const wins = cloud.filter((w: CloudNutritionEntry) => /win|assessment|mobility|mind/i.test(w.name || ''));
                  setRecentPillarWins(wins.slice(0, 5));
                  alert('Pillar wins refreshed from cloud.');
                } else {
                  alert('Sign in to load cloud wins.');
                }
              } catch { /* noop */ }
            }}>Refresh pillar wins from cloud</Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wins & Challenges — earned milestones, secondary to the primary CTA */}
      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> {t('todayYourWins', { defaultValue: 'Your Wins & Streaks' })}
          </CardTitle>
          <CardDescription>
            {t('todayYourWinsDesc', {
              defaultValue: 'Milestones earned from your logs — streaks and volume feed your Win Score.',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          {(
            [
              {
                done: streak >= 7,
                label: t('todayWin7DayStreak', { current: streak, defaultValue: `7-Day Streak (${streak}/7)` }),
              },
              {
                done: totalVolume > 1000,
                label: t('todayWinVolume', {
                  current: fmt.num(totalVolume),
                  unit: unitLabel,
                  defaultValue: `1000+ total volume (${fmt.num(totalVolume)}/1000 ${unitLabel})`,
                }),
              },
              {
                done: totalSessions >= 15,
                label: t('todayWinSessions', {
                  current: totalSessions,
                  defaultValue: `15+ Sessions Logged (${totalSessions}/15)`,
                }),
              },
              {
                done: savedWorkouts.length >= 3,
                label: t('todayWinSavedRoutines', {
                  current: savedWorkouts.length,
                  defaultValue: `3+ Saved Routines (${savedWorkouts.length}/3)`,
                }),
              },
              {
                done: highProteinDays >= 5,
                label: t('todayWinProteinDays', {
                  current: highProteinDays,
                  defaultValue: `High Protein Days (150g+) (${highProteinDays}/5+)`,
                }),
              },
            ] as { done: boolean; label: string }[]
          ).map((win, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 ${win.done ?'font-medium text-primary' : ''}`}
            >
              {win.done ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-label="done" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span>
                {win.label}
                {win.done && <Medal className="ms-1.5 inline h-3.5 w-3.5 text-accent-900" aria-label="earned" />}
              </span>
            </div>
          ))}
          <div className={`flex items-start gap-2 ${nightSessions >= 3 ?'font-medium text-muted-foreground' : ''}`}>
            {nightSessions >= 3 ? (
              <Moon className="mt-0.5 h-4 w-4 shrink-0" aria-label="done" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span>
              {t('todayWinUnderStars', {
                current: nightSessions,
                defaultValue: `Under the Stars (${nightSessions}/3 night sessions)`,
              })}
              {nightSessions > 0 && (
                <>
                  {' · '}
                  <a href="/leaderboard?board=under-the-stars" className="text-muted-foreground hover:underline">
                    {t('todayRankings', { defaultValue: 'Rankings' })}
                  </a>
                </>
              )}
            </span>
          </div>
          <div className={`flex items-start gap-2 ${dawnSessions >= 3 ?'font-medium text-status-warn' : ''}`}>
            {dawnSessions >= 3 ? (
              <Sunrise className="mt-0.5 h-4 w-4 shrink-0" aria-label="done" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span>
              {t('todayWinDawn', {
                current: dawnSessions,
                defaultValue: `By Dawn's Early Light (${dawnSessions}/3 dawn sessions)`,
              })}
              {dawnSessions > 0 && (
                <>
                  {' · '}
                  <a href="/leaderboard?board=dawns-early-light" className="text-status-warn hover:underline">
                    {t('todayRankings', { defaultValue: 'Rankings' })}
                  </a>
                </>
              )}
            </span>
          </div>
          <div className="col-span-2 text-xs text-muted-foreground">
            {t('todayWinBadgeFoot', {
              defaultValue:
                'Log wins daily — streaks & volume feed your Mission Score. Full cross-pillar challenges in updates.',
            })}
          </div>
          <div className="col-span-2 flex gap-2 mt-1 flex-wrap">
            <Button size="sm" variant="outline" className="text-xs" onClick={() => router.push('/leaderboard')}>
              {t('todayViewLeaderboard', { defaultValue: 'View Leaderboard →' })}
            </Button>
            {SHOW_TODAY_FOUNDER_TOOLS && (
              <>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => {
              const current = bumpTrainingStreak();
              alert(`Win logged! Streak now ${current}. Refresh or complete a workout to update.`); 
              router.refresh(); 
            }}>Log a daily win +1 streak</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => { alert('Great protein day logged (demo). Complete real logs in /nutrition for real tracking.'); }}>Log high-protein day</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={async () => {
              try {
                const { getUser } = await import('@/lib/supabase');
                const { enqueueNutritionUpsert } = await import('@/lib/sync/nutritionSync');
                const u = await getUser();
                const today = localDateKey();
                if (u) enqueueNutritionUpsert({ date: today, name: 'Mind Win: 5-min breath + gratitude', protein: 0, cals: 0 });
                const cur = bumpTrainingStreak();
                alert(`Mind Win logged! +1 streak (${cur}). Check Nutrition for the entry.`);
              } catch { /* noop */ }
            }}>Log Mind Win (+streak + cloud)</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => onStartStarter("Daily Mobility Circuit (Free)", freeStarters.find(s => s.name.includes("Mobility"))?.exercises || [])}>Quick Mobility Win →</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => {
              const current = bumpTrainingStreak();
              alert(`Mobility habit logged! +1 to streak (${current} days). Synergy with Move pillar builds the path.`);
              router.refresh();
            }}>Log Mobility Habit (+streak)</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => onStartStarter("Daily Mobility + Mind Habit", freeStarters.find(s => s.name.includes("Mind Habit"))?.exercises || [])}>Start Daily Habit Stack →</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => {
              alert('Log a post-mobility recovery snack in Nutrition (e.g. yogurt bowl). Builds Fuel + Move synergy.');
              router.push('/nutrition');
            }}>Log Recovery Snack (Fuel + Move) →</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PWA Install Banner (kept, now in context of daily use) */}
      {typeof window !== 'undefined' && !window.matchMedia('(display-mode: standalone)').matches && (
        <div className="p-3 border-2 border-border bg-card text-sm flex items-center justify-between gap-3">
          <span>{t('todayInstallPwa', { defaultValue: 'Install Mission Winning for offline use anywhere (PWA).' })}</span>
          <Button size="sm" variant="outline" onClick={() => {
            const mw = window as MwWindow;
            const trig = mw.triggerPwaInstall;
            if (trig) trig();
            else {
              const p = mw.deferredPwaPrompt?.();
              if (p) p.prompt();
              else
                toast({
                  title: t('todayInstallNow', { defaultValue: 'Install Now' }),
                  description: t('todayPwaInstallHint', {
                    defaultValue: 'Use browser menu (⋮ > Add to Home Screen / Install).',
                  }),
                });
            }
          }}>{t('todayInstallNow', { defaultValue: 'Install Now' })}</Button>
        </div>
      )}

      {/* Recent Activity (supporting history view) */}
      {recent.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">{t('todayRecentWins', { defaultValue: 'Recent Wins' })}</h3>
          <div className="grid gap-3">
            {recent.map((log) => (
              <Card key={log.id} className="border-2 border-border hover:border-foreground transition-colors">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{log.workoutName}</p>
                    <p className="text-sm text-muted-foreground">{fmt.longDate(log.completedAt)}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(log.durationSeconds)}
                    </span>
                    <span>
                      {fmt.num(log.totalVolume)} {unitLabel}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="link" className="mt-2 px-0" onClick={() => router.push("/history")}>
            {t('todayViewHistory', { defaultValue: 'View full history →' })}
          </Button>
        </div>
      )}
      </div>
  );
}
