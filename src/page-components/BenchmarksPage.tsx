'use client';
/**
 * Page: /benchmarks — 1RM stats
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLocaleFormat } from "@/hooks/useLocaleFormat";
import dynamic from 'next/dynamic';
import { SkeletonBlock } from '@/components/ui/Skeleton';
import {
  BarChart3,
  LineChart as LineChartIcon,
  Scale,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getExerciseById } from "@/data/exercises";
import {
  buildAllBenchmarkSummaries,
  buildExerciseBenchmark,
  getExercisesWithBenchmarkData,
} from "@/lib/benchmarks";
import { useUnits, weightUnitLabel } from "@/hooks/useUnits";
import { useWorkoutStore } from "@/store/workoutStore";

const Benchmarks1RMChart = dynamic(
  () => import('@/components/benchmarks/Benchmarks1RMChart').then((m) => m.Benchmarks1RMChart),
  { ssr: false, loading: () => <SkeletonBlock className="h-72" label="Loading 1RM chart" /> }
);
import { MilitaryReadinessSection } from "@/components/benchmarks/MilitaryReadinessSection";
import { PresidentialFitnessSection } from "@/components/fitness-test/PresidentialFitnessSection";
import { PillarPageShell } from "@/components/layout/PillarPageShell";
import { EmptyState } from '@/components/ui/EmptyState';
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { AnatomyHeatMap } from "@/components/history/AnatomyHeatMap";
import { buildMuscleHeatmap } from "@/lib/historyAnalytics";
import { bumpTrainingStreak } from "@/lib/streaks";

export function BenchmarksPage() {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const router = useRouter();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const heatmapCells = useMemo(
    () => buildMuscleHeatmap(workoutHistory, 14),
    [workoutHistory]
  );
  const exerciseIds = useMemo(
    () => getExercisesWithBenchmarkData(workoutHistory),
    [workoutHistory]
  );
  const summaries = useMemo(
    () => buildAllBenchmarkSummaries(workoutHistory),
    [workoutHistory]
  );

  const [selectedId, setSelectedId] = useState<string>("");

  const activeId = selectedId || exerciseIds[0] || "";
  const benchmark = useMemo(
    () => (activeId ? buildExerciseBenchmark(activeId, workoutHistory) : null),
    [activeId, workoutHistory]
  );

  const chartData = useMemo(() => {
    if (!benchmark) return [];
    return benchmark.timeline.map((point) => ({
      date: fmt.axisDate(point.date),
      estimated: point.estimated1RM,
      actual: point.actual1RM,
    }));
    // `fmt` and not just `benchmark`: `.242` — the axis label is built here now
    // that `dateLabel` is gone from the data, so the memo has to invalidate when
    // the language does or the chart keeps the previous one.
  }, [benchmark, fmt]);

  const globalStats = useMemo(() => {
    const withActual = summaries.filter((s) => s.bestActual1RM !== null);
    const avgDelta =
      withActual.length > 0
        ? Math.round(
            withActual.reduce((sum, s) => sum + (s.estimateVsActualDelta ?? 0), 0) /
              withActual.length
          )
        : null;
    return {
      exercisesTracked: summaries.length,
      totalSessions: summaries.reduce((s, b) => s + b.sessionCount, 0),
      avgDelta,
    };
  }, [summaries]);

  /*
   * `.241` — the starters render in **both** branches.
   *
   * These four one-tap session launchers sat inside the has-data `else` only, so
   * they were visible exclusively to athletes who already had benchmark data —
   * and hidden from the only person the screen's empty state is addressed to.
   * The empty copy said "complete workouts with logged sets" while the buttons
   * that do exactly that were behind the condition it described.
   */
  const quickStarters = (
    <Card className="content-card mt-4 border-primary">
      <CardHeader>
        <CardTitle className="text-base">
          {t('benchmarksQuickTitle', { defaultValue: 'Quick Benchmark Starters (Free)' })}
        </CardTitle>
        <CardDescription>
          {t('benchmarksQuickDesc', {
            defaultValue:
              'Start a short session focused on common benchmark lifts. Log sets → see progress here next time. Bumps streak on launch.',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => {
          const store = useWorkoutStore.getState();
          store.startWorkout("Bench Benchmark", [{ exerciseId: "bench-press", sets: [{ reps: 5, weight: 0 }, { reps: 5, weight: 0 }, { reps: 3, weight: 0 }] }]);
          bumpTrainingStreak();
          router.push('/active');
        }}>{t('benchmarksQuickBench', { defaultValue: 'Bench 5/3/1 style →' })}</Button>
        <Button size="sm" variant="outline" onClick={() => {
          const store = useWorkoutStore.getState();
          store.startWorkout("Squat Benchmark", [{ exerciseId: "squats", sets: [{ reps: 5, weight: 0 }, { reps: 5, weight: 0 }, { reps: 3, weight: 0 }] }]);
          bumpTrainingStreak();
          router.push('/active');
        }}>{t('benchmarksQuickSquat', { defaultValue: 'Squat working sets →' })}</Button>
        <Button size="sm" variant="outline" onClick={() => {
          const store = useWorkoutStore.getState();
          store.startWorkout("Deadlift Benchmark", [{ exerciseId: "deadlift", sets: [{ reps: 3, weight: 0 }, { reps: 3, weight: 0 }] }]);
          bumpTrainingStreak();
          router.push('/active');
        }}>{t('benchmarksQuickDeadlift', { defaultValue: 'Deadlift pulls →' })}</Button>
        <Button size="sm" variant="outline" onClick={() => router.push('/log')}>{t('benchmarksQuickStarters', { defaultValue: 'All free starters in Today →' })}</Button>
        <Button size="sm" variant="ghost" onClick={() => {
          try {
            const cur = bumpTrainingStreak();
            alert(`Benchmark habit logged! Streak +1 (${cur}). Complete the session to update charts.`);
          } catch { /* noop */ }
        }}>{t('benchmarksQuickHabit', { defaultValue: 'Log benchmark habit (+streak)' })}</Button>
      </CardContent>
    </Card>
  );

  if (workoutHistory.length === 0 || exerciseIds.length === 0) {
    return (
      <PillarPageShell icon={Shield} eyebrow={t('benchmarksEyebrow', { defaultValue: 'Benchmarks' })} title={t('benchmarksTitle', { defaultValue: 'Benchmarks' })} subtitle={t('benchmarksSubtitle', {
          defaultValue: 'Statistics, rep maxes, estimated vs actual, and progress over time.',
        })}
        showLegalFooter
      >
        <EmptyState
          icon={BarChart3}
          title={t('benchmarksEmptyTitle', { defaultValue: 'No benchmark data yet' })}
          description={t('benchmarksEmptyDesc', {
            defaultValue:
              'Complete workouts with logged sets to build estimated 1RMs. Log a set at 1 rep to record an actual 1RM for comparison.',
          })}
        />
        {quickStarters}
        <MilitaryReadinessSection />
        <PresidentialFitnessSection />
      </PillarPageShell>
    );
  }

  return (
    <PillarPageShell icon={Shield} eyebrow={t('benchmarksEyebrow', { defaultValue: 'Benchmarks' })} title={t('benchmarksTitle', { defaultValue: 'Benchmarks' })} subtitle={t('benchmarksSubtitle', {
        defaultValue: 'Statistics, rep maxes, estimated vs actual, and progress over time.',
      })}
      showLegalFooter
    >
      <MilitaryReadinessSection />
      <PresidentialFitnessSection />

      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-base">
            {t('anatomyMapTitle', { defaultValue: 'Muscle balance' })}
          </CardTitle>
          <CardDescription>
            {t('anatomyMapDesc', {
              defaultValue: '14-day volume by major group — tap a region for exercises.',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnatomyHeatMap cells={heatmapCells} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="card-boss">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              {t('benchmarksExercisesTracked', { defaultValue: 'Exercises Tracked' })}
            </CardDescription>
            <CardTitle className="text-3xl">{globalStats.exercisesTracked}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="content-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('benchmarksSessions', { defaultValue: 'Benchmark Sessions' })}
            </CardDescription>
            <CardTitle className="text-3xl">{globalStats.totalSessions}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="content-card border-secondary/20 bg-secondary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-secondary" />
              {t('benchmarksAvgGap', { defaultValue: 'Avg Est. − Actual' })}
            </CardDescription>
            <CardTitle className="text-3xl">
              {globalStats.avgDelta !== null ? (
                <>
                  {globalStats.avgDelta > 0 ? "+" : ""}
                  {globalStats.avgDelta}{" "}
                  <span className="text-lg font-normal text-muted-foreground">{unitLabel}</span>
                </>
              ) : (
                <span className="text-lg text-muted-foreground">—</span>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Select value={activeId} onValueChange={setSelectedId}>
          <SelectTrigger
            className="w-full sm:w-72"
            aria-label={t('benchmarksSelectExercise', { defaultValue: 'Select exercise…' })}
          >
            <SelectValue placeholder={t('benchmarksSelectExercise', { defaultValue: 'Select exercise…' })}
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
        <p className="text-xs text-muted-foreground">
          {t('benchmarksFormulaNote', {
            defaultValue:
              'Estimates use the Epley formula from logged sets. Actual = weight on 1-rep sets.',
          })}
        </p>
      </div>

      {benchmark && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="content-card">
              <CardHeader className="pb-2">
                <CardDescription>
                  {t('benchmarksBestEst', { defaultValue: 'Best Estimated 1RM' })}
                </CardDescription>
                <CardTitle className="text-2xl text-primary">
                  {benchmark.bestEstimated1RM}{" "}
                  <span className="text-sm font-normal text-muted-foreground">{unitLabel}</span>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="content-card">
              <CardHeader className="pb-2">
                <CardDescription>
                  {t('benchmarksBestActual', { defaultValue: 'Best Actual 1RM' })}
                </CardDescription>
                <CardTitle className="text-2xl text-secondary">
                  {benchmark.bestActual1RM !== null ? (
                    <>
                      {benchmark.bestActual1RM}{" "}
                      <span className="text-sm font-normal text-muted-foreground">{unitLabel}</span>
                    </>
                  ) : (
                    <span className="text-base text-muted-foreground">
                      {t('benchmarksNo1Rep', { defaultValue: 'No 1-rep sets' })}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="content-card">
              <CardHeader className="pb-2">
                <CardDescription>
                  {t('benchmarksLatestEst', { defaultValue: 'Latest Session Est.' })}
                </CardDescription>
                <CardTitle className="text-2xl">
                  {benchmark.latestEstimated1RM}{" "}
                  <span className="text-sm font-normal text-muted-foreground">{unitLabel}</span>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="content-card">
              <CardHeader className="pb-2">
                <CardDescription>
                  {t('benchmarksEstVsActual', { defaultValue: 'Est. vs Actual Gap' })}
                </CardDescription>
                <CardTitle className="text-2xl">
                  {benchmark.estimateVsActualDelta !== null ? (
                    <>
                      {benchmark.estimateVsActualDelta > 0 ? "+" : ""}
                      {benchmark.estimateVsActualDelta}{" "}
                      <span className="text-sm font-normal text-muted-foreground">{unitLabel}</span>
                    </>
                  ) : (
                    <span className="text-base text-muted-foreground">—</span>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground">
            <span>
              {t('benchmarksSessionsLogged', {
                count: benchmark.sessionCount,
                defaultValue: `${benchmark.sessionCount} sessions logged`,
              })}
            </span>
            <span>
              {t('benchmarksTotalSets', {
                count: benchmark.totalSets,
                defaultValue: `${benchmark.totalSets} total sets`,
              })}
            </span>
          </div>

          <Card className="content-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LineChartIcon className="h-5 w-5 text-primary" />
                {t('benchmarks1rmProgress', { defaultValue: '1RM Progress' })}
              </CardTitle>
              <CardDescription>
                {t('benchmarks1rmProgressDesc', {
                  defaultValue:
                    'Estimated (dashed) from all sets · Actual (solid) from 1-rep attempts only',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Benchmarks1RMChart data={chartData} unitLabel={unitLabel} />
            </CardContent>
          </Card>

          <Card className="content-card">
            <CardHeader>
              <CardTitle className="text-lg">
                {t('benchmarksTimeline', { defaultValue: 'Timeline' })}
              </CardTitle>
              <CardDescription>
                {t('benchmarksTimelineDesc', {
                  defaultValue: 'Per-session best estimated and actual rep maxes',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('benchmarksTableDate', { defaultValue: 'Date' })}</TableHead>
                    <TableHead>{t('benchmarksTableWorkout', { defaultValue: 'Workout' })}</TableHead>
                    <TableHead>{t('benchmarksTableBestSet', { defaultValue: 'Best Set' })}</TableHead>
                    <TableHead>{t('benchmarksTableEst', { defaultValue: 'Estimated 1RM' })}</TableHead>
                    <TableHead>{t('benchmarksTableActual', { defaultValue: 'Actual 1RM' })}</TableHead>
                    <TableHead>{t('benchmarksTableDelta', { defaultValue: 'Δ' })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...benchmark.timeline].reverse().map((point) => {
                    const delta =
                      point.actual1RM !== null
                        ? point.estimated1RM - point.actual1RM
                        : null;
                    return (
                      <TableRow key={point.workoutId}>
                        <TableCell className="whitespace-nowrap">
                          {fmt.longDate(point.date)}
                        </TableCell>
                        <TableCell>{point.workoutName}</TableCell>
                        <TableCell>
                          {t('benchmarksWeightTimesReps', {
                            weight: point.bestSet.weight,
                            unit: unitLabel,
                            reps: point.bestSet.reps,
                            defaultValue: `${point.bestSet.weight} ${unitLabel} × ${point.bestSet.reps}`,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {point.estimated1RM} {unitLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {point.actual1RM !== null ? (
                            <Badge variant="secondary">
                              {point.actual1RM} {unitLabel}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {delta !== null ? (
                            <span className={delta > 0 ? "text-primary" : "text-secondary"}>
                              {delta > 0 ? "+" : ""}
                              {delta}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {summaries.length > 1 && (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('benchmarksAllExercises', { defaultValue: 'All Exercises' })}
                </CardTitle>
                <CardDescription>
                  {t('benchmarksAllExercisesDesc', {
                    defaultValue: 'Quick comparison across logged movements',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t('benchmarksTableExercise', { defaultValue: 'Exercise' })}
                      </TableHead>
                      <TableHead>{t('benchmarksSessions', { defaultValue: 'Benchmark Sessions' })}</TableHead>
                      <TableHead>{t('benchmarksBestEst', { defaultValue: 'Best Estimated 1RM' })}</TableHead>
                      <TableHead>{t('benchmarksBestActual', { defaultValue: 'Best Actual 1RM' })}</TableHead>
                      <TableHead>{t('benchmarksEstVsActual', { defaultValue: 'Est. vs Actual Gap' })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaries.map((s) => {
                      const ex = getExerciseById(s.exerciseId);
                      return (
                        <TableRow key={s.exerciseId}
                          className={
                            s.exerciseId === activeId ? "bg-accent-100" : "cursor-pointer"
                          }
                          onClick={() => setSelectedId(s.exerciseId)}
                        >
                          <TableCell className="font-medium">
                            {ex?.name ?? s.exerciseId}
                          </TableCell>
                          <TableCell>{s.sessionCount}</TableCell>
                          <TableCell>
                            {s.bestEstimated1RM} {unitLabel}
                          </TableCell>
                          <TableCell>
                            {s.bestActual1RM !== null ? `${s.bestActual1RM} ${unitLabel}` : "—"}
                          </TableCell>
                          <TableCell>
                            {s.estimateVsActualDelta !== null
                              ? `${s.estimateVsActualDelta > 0 ? "+" : ""}${s.estimateVsActualDelta}`
                              : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {quickStarters}

      <SignInPrompt
        className="mt-6"
        nextPath="/benchmarks" description={t('benchmarksSignInFoot', {
          defaultValue: 'Sync benchmark history and PRs across devices.',
        })}
      />
    </PillarPageShell>
  );
}
