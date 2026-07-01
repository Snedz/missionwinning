'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Dumbbell, Timer, Trophy } from 'lucide-react';
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
import { History1RMChart, HistoryVolumeChart } from '@/components/history/HistoryCharts';
import { MuscleHeatmap } from '@/components/history/MuscleHeatmap';
import { getExerciseById } from '@/data/exercises';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import { countsTowardVolume, setKindDefaultLabel, setKindLabelKey } from '@/lib/setKind';
import {
  build1RMChartData,
  buildMuscleHeatmap,
  buildWeeklyVolumeTimeline,
  historySummaryStats,
  pickChartExerciseId,
} from '@/lib/historyAnalytics';
import { getExercisesWithBenchmarkData } from '@/lib/benchmarks';
import { useWorkoutStore } from '@/store/workoutStore';
import type { CompletedWorkoutLog, SetKind } from '@/types';
import { getUser, getUserNutritionForDate } from '@/lib/supabase';

const HEATMAP_WINDOW_DAYS = 14;

function kindBadgeClass(kind: SetKind): string {
  if (kind === 'warmup') return 'border-amber-500/40 bg-amber-950/30 text-amber-300';
  if (kind === 'failure') return 'border-rose-500/40 bg-rose-950/30 text-rose-300';
  return '';
}

export function HistoryPage() {
  const { t, i18n } = useTranslation();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const loadFromCloud = useWorkoutStore((s) => s.loadFromCloud);
  const [selected, setSelected] = useState<CompletedWorkoutLog | null>(null);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pillarWins, setPillarWins] = useState<any[]>([]);
  const [chartExerciseId, setChartExerciseId] = useState('');

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
          const wins = cloud.filter((c: any) =>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t('historyTitle', { defaultValue: 'Workout History' })}
        </h2>
        <p className="text-muted-foreground">
          {t('historySubtitle', {
            defaultValue: 'Your history powers the Today Hub readiness and Win Score.',
          })}{' '}
          <a href="/log" className="underline">
            Today Hub
          </a>
        </p>
        <p className="mt-1 text-muted-foreground">
          {sessionLabel}
          {syncing && t('historySyncing', { defaultValue: ' — syncing cloud…' })}
          {!syncing && cloudSynced && t('historyCloudMerged', { defaultValue: ' — cloud merged' })}
        </p>
        {workoutHistory.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {t('historyAvgVolume', {
              avg: summary.avgVolume.toLocaleString(),
              unit: unitLabel,
              defaultValue: `Recent trend: Avg volume last 5: ${summary.avgVolume.toLocaleString()} ${unitLabel}.`,
            })}{' '}
            <a href="/log" className="underline">
              Today Hub
            </a>
          </p>
        )}
      </div>

      {workoutHistory.length > 0 && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
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
          <MuscleHeatmap cells={heatmapCells} windowDays={HEATMAP_WINDOW_DAYS} />
        </>
      )}

      {workoutHistory.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium">{t('historyEmptyTitle', { defaultValue: 'No workouts logged yet' })}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('historyEmptyDesc', { defaultValue: 'Complete an active workout to see it here.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {workoutHistory.map((log) => (
            <Card key={log.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold text-lg">{log.workoutName}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(log.completedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5" />
                      {formatDuration(log.durationSeconds)}
                    </span>
                    <span>{log.exercises.length} exercises</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {t('historyTotalVolume', { defaultValue: 'Total Volume' })}
                    </p>
                    <p className="text-xl font-bold text-secondary">
                      {log.totalVolume.toLocaleString()}{' '}
                      <span className="text-sm font-normal">{unitLabel}</span>
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setSelected(log)}>
                    {t('historyDetails', { defaultValue: 'Details' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
                <a href="/nutrition" className="text-xs underline">
                  View in Nutrition →
                </a>
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
                                  kind === 'failure' && 'bg-rose-950/10'
                                )}
                              >
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>
                                  {kind === 'normal' ? (
                                    <span className="text-muted-foreground">—</span>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className={cn('text-[10px] uppercase', kindBadgeClass(kind))}
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
        <a href="/profile" className="text-emerald-400 hover:underline">
          {t('historySignInFoot', { defaultValue: 'Sign in (optional) to load full cloud history.' })}
        </a>
      </p>
    </div>
  );
}
