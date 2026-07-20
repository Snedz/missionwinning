'use client';
/**
 * Page: /history — past workouts
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Calendar, Dumbbell, History as HistoryIcon, Timer, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import dynamic from 'next/dynamic';
import { MuscleHeatmap } from '@/components/history/MuscleHeatmap';

const History1RMChart = dynamic(
  () => import('@/components/history/HistoryCharts').then((m) => m.History1RMChart),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-lg bg-muted/30" /> }
);
const HistoryVolumeChart = dynamic(
  () => import('@/components/history/HistoryCharts').then((m) => m.HistoryVolumeChart),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-lg bg-muted/30" /> }
);
import { getExerciseById } from '@/data/exercises';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import { countsTowardVolume, setKindBadgeClass, setKindDefaultLabel, setKindLabelKey } from '@/lib/workout/setKind';
import {
  build1RMChartData,
  buildMuscleHeatmap,
  buildWeeklyVolumeTimeline,
  historySummaryStats,
  pickChartExerciseId,
} from '@/lib/historyAnalytics';
import { getExercisesWithBenchmarkData } from '@/lib/benchmarks';
import { useWorkoutStore } from '@/store/workoutStore';
import type { CompletedWorkoutLog } from '@/types';
import { getUser, getUserNutritionForDate, type CloudNutritionEntry } from '@/lib/supabase';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { TodaySection } from '@/components/journey/TodaySection';
import { Input } from '@/components/ui/input';

const HEATMAP_WINDOW_DAYS = 14;

type RangeFilter = '7' | '30' | 'all';

export function HistoryPage() {
  const { t, i18n } = useTranslation();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const loadFromCloud = useWorkoutStore((s) => s.loadFromCloud);
  const [selected, setSelected] = useState<CompletedWorkoutLog | null>(null);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pillarWins, setPillarWins] = useState<CloudNutritionEntry[]>([]);
  const [chartExerciseId, setChartExerciseId] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [range, setRange] = useState<RangeFilter>('30');
  const [visibleCount, setVisibleCount] = useState(30);

  const filteredHistory = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    const cutoff =
      range === 'all'
        ? 0
        : Date.now() - Number(range) * 24 * 60 * 60 * 1000;
    return workoutHistory.filter((log) => {
      if (cutoff && new Date(log.completedAt).getTime() < cutoff) return false;
      if (q && !log.workoutName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [workoutHistory, nameQuery, range]);

  const visibleHistory = useMemo(
    () => filteredHistory.slice(0, visibleCount),
    [filteredHistory, visibleCount]
  );

  const weeklyVolume = useMemo(
    () => buildWeeklyVolumeTimeline(workoutHistory, 12, i18n.language),
    [workoutHistory, i18n.language]
  );
  const heatmapCells = useMemo(
    () => buildMuscleHeatmap(workoutHistory, HEATMAP_WINDOW_DAYS),
    [workoutHistory]
  );
  const exerciseIds = useMemo(
    () => getExercisesWithBenchmarkData(workoutHistory),
    [workoutHistory]
  );
  const defaultExerciseId = useMemo(() => pickChartExerciseId(workoutHistory), [workoutHistory]);
  const activeChartId = chartExerciseId || defaultExerciseId || '';
  const oneRmData = useMemo(
    () => (activeChartId ? build1RMChartData(activeChartId, workoutHistory) : []),
    [activeChartId, workoutHistory]
  );
  const summary = useMemo(() => historySummaryStats(workoutHistory), [workoutHistory]);

  const briefingLine = useMemo(() => {
    if (workoutHistory.length === 0) {
      return t('historyBriefingEmpty', {
        defaultValue: 'Your mission story starts with the first logged set.',
      });
    }
    const sessions = summary.sessionCount;
    const vol = summary.totalVolume;
    return t('historyBriefingLine', {
      count: sessions,
      volume: vol.toLocaleString(),
      defaultValue: `${sessions} sessions · ${vol.toLocaleString()} total volume — consistency compounds.`,
    });
  }, [workoutHistory.length, summary, t]);

  useEffect(() => {
    const sync = async () => {
      setSyncing(true);
      const user = await getUser();
      if (user) {
        await loadFromCloud();
        setCloudSynced(true);
        try {
          const today = new Date().toISOString().split('T')[0];
          const cloud = await getUserNutritionForDate(today);
          const wins = cloud.filter((c: CloudNutritionEntry) =>
            /win|assessment|mobility|mind|track|learn|move/i.test(c.name || '')
          );
          setPillarWins(wins);
        } catch {
          /* offline */
        }
      }
      setSyncing(false);
    };
    sync();
  }, [loadFromCloud]);

  const sessionLabel =
    workoutHistory.length === 1
      ? t('historySessionCount', { count: 1, defaultValue: '1 completed session' })
      : t('historySessionCount', {
          count: workoutHistory.length,
          defaultValue: `${workoutHistory.length} completed sessions`,
        });

  return (
    <PillarPageShell
      icon={HistoryIcon}
      eyebrow={t('historyEyebrow', { defaultValue: 'History' })}
      title={t('historyTitle', { defaultValue: 'Workout History' })}
      subtitle={t('historySubtitle', {
        defaultValue: 'Your history powers the Today Hub readiness and Win Score.',
      })}
    >
      <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 space-y-1 ring-draw-in">
        <p className="text-[10px] uppercase tracking-widest text-primary/90 font-medium">
          {t('historyMissionStory', { defaultValue: 'Mission story' })}
        </p>
        <p className="text-sm text-foreground leading-snug">{briefingLine}</p>
        {summary.sessionCount > 0 && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {t('historyAvgVolume', {
              avg: summary.avgVolume.toLocaleString(),
              unit: unitLabel,
              defaultValue: `Recent avg volume ${summary.avgVolume.toLocaleString()} ${unitLabel}`,
            })}
          </p>
        )}
      </div>

      <div>
        <p className="text-muted-foreground text-sm">
          <Link href="/log" className="underline">
            Today Hub
          </Link>
        </p>
        <p className="mt-1 text-muted-foreground">
          {sessionLabel}
          {syncing && t('historySyncing', { defaultValue: ' — syncing cloud…' })}
          {!syncing && cloudSynced && t('historyCloudMerged', { defaultValue: ' — cloud merged' })}
        </p>
      </div>

      {workoutHistory.length > 0 && (
        <TodaySection
          title={t('historyTrendsTitle', { defaultValue: 'Trends' })}
          description={t('historyTrendsDesc', {
            defaultValue: 'Volume, estimated 1RM, and muscle heatmap',
          })}
          defaultOpen={false}
        >
          <div className="grid gap-4 lg:grid-cols-2 pt-3">
            <HistoryVolumeChart data={weeklyVolume} />
            <div className="space-y-2">
              {exerciseIds.length > 1 && (
                <Select value={activeChartId} onValueChange={setChartExerciseId}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('historySelectExercise', { defaultValue: 'Chart exercise' })}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseIds.map((id) => {
                      const ex = getExerciseById(id);
                      return (
                        <SelectItem key={id} value={id}>
                          {ex?.name ?? id}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              <History1RMChart
                data={oneRmData}
                exerciseName={getExerciseById(activeChartId)?.name ?? activeChartId}
              />
            </div>
          </div>
          <div className="pt-3">
            <MuscleHeatmap cells={heatmapCells} windowDays={HEATMAP_WINDOW_DAYS} />
          </div>
        </TodaySection>
      )}

      {workoutHistory.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={t('historyEmptyTitle', { defaultValue: 'No workouts logged yet' })}
          description={t('historyEmptyDesc', {
            defaultValue:
              'Basic Training step: open Today → Just Go, finish one set. Your first session appears here and Mission Score starts moving.',
          })}
          actionLabel={t('historyStartWorkout', { defaultValue: 'Go to Today' })}
          href="/log"
        />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="search"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              placeholder={t('historySearchPlaceholder', {
                defaultValue: 'Search by workout name…',
              })}
              className="sm:flex-1"
            />
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ['7', 'Last 7'],
                  ['30', 'Last 30'],
                  ['all', 'All'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setRange(value);
                    setVisibleCount(30);
                  }}
                  className={
                    range === value
                      ? 'rounded-full border border-primary/50 bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary'
                      : 'rounded-full border border-border/50 px-3 py-1.5 text-xs text-muted-foreground'
                  }
                >
                  {t(`historyRange${value}`, { defaultValue: label })}
                </button>
              ))}
            </div>
          </div>
          {filteredHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {t('historyNoMatches', { defaultValue: 'No sessions match these filters.' })}
            </p>
          ) : (
            <>
            {visibleHistory.map((log) => (
              <Card
                key={log.id}
                className="content-card hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setSelected(log)}
              >
                <CardContent className="flex items-center justify-between gap-3 py-3 px-4">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{log.workoutName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(log.completedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {formatDuration(log.durationSeconds)}
                      </span>
                      <span>
                        {log.exercises.length} · {log.totalVolume.toLocaleString()} {unitLabel}
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(log);
                    }}
                  >
                    {t('historyDetails', { defaultValue: 'Details' })}
                  </Button>
                </CardContent>
              </Card>
            ))}
            {filteredHistory.length > visibleCount ? (
              <Button
                type="button"
                variant="outline"
                className="w-full min-h-[44px]"
                onClick={() => setVisibleCount((n) => n + 30)}
              >
                {t('historyLoadMore', {
                  remaining: filteredHistory.length - visibleCount,
                  defaultValue: `Show more (${filteredHistory.length - visibleCount} left)`,
                })}
              </Button>
            ) : null}
            </>
          )}
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5" />{' '}
          {t('historyPillarWins', { defaultValue: 'Pillar Wins & Habit Logs' })}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          {t('historyPillarWinsDesc', {
            defaultValue:
              'Mobility wins, mind prompts, assessments logged from pillars appear here.',
          })}
        </p>
        {pillarWins.length > 0 ? (
          <div className="space-y-2">
            {pillarWins.slice(0, 5).map((w, i) => (
              <div
                key={i}
                className="text-sm p-2 border rounded bg-muted/20 flex justify-between"
              >
                <span>
                  {w.name}{' '}
                  <span className="text-xs text-muted-foreground">
                    ({formatDate(w.date || new Date().toISOString())})
                  </span>
                </span>
                <Link href="/nutrition" className="text-xs underline">
                  View in Nutrition →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            No pillar wins logged today yet. Use /move or /mind, or complete Assessment.
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.workoutName}</DialogTitle>
                <DialogDescription>
                  {formatDate(selected.completedAt)} · {formatDuration(selected.durationSeconds)} ·{' '}
                  {t('historySessionVolume', {
                    volume: selected.totalVolume.toLocaleString(),
                    unit: unitLabel,
                    defaultValue: `${selected.totalVolume.toLocaleString()} ${unitLabel} total volume`,
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {selected.exercises.map((ex) => {
                  const exercise = getExerciseById(ex.exerciseId);
                  return (
                    <div key={ex.exerciseId} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{exercise?.name ?? ex.exerciseId}</h4>
                        {exercise?.muscleGroups.map((mg) => (
                          <Badge key={mg} variant="muscle" className="text-[10px]">
                            {mg}
                          </Badge>
                        ))}
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('historyTableSet', { defaultValue: 'Set' })}</TableHead>
                            <TableHead>{t('historyTableType', { defaultValue: 'Type' })}</TableHead>
                            <TableHead>{t('historyTableReps', { defaultValue: 'Reps' })}</TableHead>
                            <TableHead>{t('historyTableWeight', { defaultValue: 'Weight' })}</TableHead>
                            <TableHead>{t('historyTableVolume', { defaultValue: 'Volume' })}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ex.sets.map((set, i) => {
                            const kind = set.kind ?? 'normal';
                            const countsVolume = countsTowardVolume(kind);
                            return (
                              <TableRow
                                key={i}
                                className={cn(
                                  kind === 'warmup' && 'bg-amber-950/10',
                                  kind === 'failure' && 'bg-rose-950/10',
                                  kind === 'drop' && 'bg-violet-950/10'
                                )}
                              >
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>
                                  {kind === 'normal' ? (
                                    <span className="text-muted-foreground">—</span>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className={cn('text-[10px] uppercase', setKindBadgeClass(kind))}
                                    >
                                      {t(setKindLabelKey(kind), {
                                        defaultValue: setKindDefaultLabel(kind),
                                      })}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>{set.reps}</TableCell>
                                <TableCell>
                                  {set.weight} {unitLabel}
                                </TableCell>
                                <TableCell>
                                  {countsVolume ? (
                                    <>
                                      {(set.reps * set.weight).toLocaleString()} {unitLabel}
                                    </>
                                  ) : (
                                    t('historyWarmupExcluded', { defaultValue: '—' })
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/profile" className="text-primary hover:underline">
          {t('historySignInFoot', { defaultValue: 'Sign in (optional) to load full cloud history.' })}
        </Link>
      </p>
    </PillarPageShell>
  );
}
