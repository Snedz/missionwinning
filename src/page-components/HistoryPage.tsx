'use client';
/**
 * Page: /history — past workouts
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { Calendar, Dumbbell, History as HistoryIcon, SearchX, Timer, Trophy } from 'lucide-react';
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
import { getJournalEntry } from '@/lib/journal/journalStore';
import { JournalTimeline } from '@/components/history/JournalTimeline';
import { HistoryCalendar } from '@/components/history/HistoryCalendar';
import { AnatomyHeatMap } from '@/components/history/AnatomyHeatMap';

const History1RMChart = dynamic(
  () => import('@/components/history/HistoryCharts').then((m) => m.History1RMChart),
  { ssr: false, loading: () => <div className="h-48 animate-pulse bg-card" /> }
);
const HistoryVolumeChart = dynamic(
  () => import('@/components/history/HistoryCharts').then((m) => m.HistoryVolumeChart),
  { ssr: false, loading: () => <div className="h-48 animate-pulse bg-card" /> }
);
import { getExerciseById } from '@/data/exercises';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { cn, formatDuration } from '@/lib/utils';
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
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { localDateKey, localDateKeyFromIso } from '@/lib/time/localDate';

const HEATMAP_WINDOW_DAYS = 14;

type RangeFilter = '7' | '30' | 'all';
type HistoryTab = 'calendar' | 'sessions' | 'journal';

export function HistoryPage() {
  const { t, i18n } = useTranslation();
  const fmt = useLocaleFormat();
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
  const [tab, setTab] = useState<HistoryTab>('sessions');

  /*
   * Days the athlete used the app without lifting.
   *
   * Read from the pillar-win rows this page already loads rather than opening
   * five more stores — `.178`: the calendar and the "Pillar Wins" list below it
   * must not be able to disagree about what happened on a day.
   */
  const loggedDayKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const w of pillarWins) {
      const key = localDateKeyFromIso(w.date ?? '');
      if (key) keys.add(key);
    }
    return keys;
  }, [pillarWins]);

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
      volume: fmt.num(vol),
      defaultValue: `${sessions} sessions · ${fmt.num(vol)} total volume — consistency compounds.`,
    });
  }, [workoutHistory.length, summary, t, fmt]);

  useEffect(() => {
    const sync = async () => {
      setSyncing(true);
      const user = await getUser();
      if (user) {
        await loadFromCloud();
        setCloudSynced(true);
        try {
          const today = localDateKey();
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
      title={t('historyTitle', { defaultValue: 'Past sessions' })}
      subtitle={t('historySubtitle', {
        defaultValue: 'What you logged — powers readiness on Today and Coach week plans.',
      })}
    >
      <div className="border-2 border-border bg-card px-4 py-3 space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">
          {t('historyMissionStory', { defaultValue: 'At a glance' })}
        </p>
        <p className="text-sm text-foreground leading-relaxed">{briefingLine}</p>
        {summary.sessionCount > 0 && (
          <p className="text-xs text-muted-foreground tabular-nums leading-relaxed">
            {t('historyAvgVolume', {
              avg: fmt.num(summary.avgVolume),
              unit: unitLabel,
              defaultValue: `Recent avg volume ${fmt.num(summary.avgVolume)} ${unitLabel}`,
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
          <div className="pt-3 space-y-4">
            <AnatomyHeatMap cells={heatmapCells} />
            <MuscleHeatmap cells={heatmapCells} windowDays={HEATMAP_WINDOW_DAYS} />
          </div>
        </TodaySection>
      )}

      {workoutHistory.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          illustrationSrc="/brand/mascot/scout-invite.webp"
          illustrationAlt=""
          title={t('historyEmptyTitle', { defaultValue: 'No workouts logged yet' })}
          description={t('historyEmptyDesc', {
            defaultValue: 'No session yet. Start when ready — open Today → Just Go, finish one set.',
          })}
          actionLabel={t('historyStartWorkout', { defaultValue: 'Go to Today' })}
          href="/log"
        />
      ) : (
        <div className="space-y-3">
          {/* Sessions = the numbers; Journal = the words (fragments + debriefs +
              check-in notes, device-only). */}
          <SegmentedControl
            options={[
              { value: 'calendar' as const, label: t('historyTabCalendar', { defaultValue: 'Calendar' }) },
              { value: 'sessions' as const, label: t('historyTabSessions', { defaultValue: 'Sessions' }) },
              { value: 'journal' as const, label: t('historyTabJournal', { defaultValue: 'Journal' }) },
            ]}
            value={tab}
            onChange={setTab}
            ariaLabel={t('historyTabsLabel', { defaultValue: 'History view' })}
          />
          {tab === 'calendar' ? (
            <HistoryCalendar history={workoutHistory} loggedKeys={loggedDayKeys} />
          ) : tab === 'journal' ? (
            <JournalTimeline />
          ) : (
          <>
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
                      ? 'min-h-[44px] border-2 border-transparent bg-primary-fill px-3 text-xs font-semibold text-primary-foreground'
                      : 'min-h-[44px] border-2 border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-foreground/[0.07]'
                  }
                >
                  {t(`historyRange${value}`, { defaultValue: label })}
                </button>
              ))}
            </div>
          </div>
          {filteredHistory.length === 0 ? (
            /* `.241` — was a centred muted sentence with no way out, while
               `LibraryPage:369` solved the identical case with an EmptyState and
               a clear-filters action. A filter miss the user cannot undo without
               guessing which control caused it is a dead end. */
            <EmptyState
              icon={SearchX}
              title={t('historyNoMatches', { defaultValue: 'No sessions match these filters' })}
              description={t('historyNoMatchesDesc', {
                defaultValue:
                  'Nothing in this range matches that search. Widen the range or clear the search to see everything you have logged.',
              })}
              actionLabel={t('historyClearFilters', { defaultValue: 'Clear filters' })}
              onAction={() => {
                setNameQuery('');
                setRange('all');
              }}
            />
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
                        {fmt.longDate(log.completedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {formatDuration(log.durationSeconds)}
                      </span>
                      <span>
                        {log.exercises.length} · {fmt.num(log.totalVolume)} {unitLabel}
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
                    ({fmt.longDate(w.date || new Date().toISOString())})
                  </span>
                </span>
                <Link href="/nutrition" className="text-xs underline">
                  View in Nutrition →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          /* `.241` — was hardcoded English (so it stayed English in all fifteen
             locales) and it spoke in raw URLs: "Use /move or /mind". A path is
             not a sentence, and the athlete cannot tap it. */
          <p className="text-xs text-muted-foreground">
            {t('historyNoPillarWins', {
              defaultValue:
                'No pillar wins logged today yet — a mobility flow, a check-in or an assessment all count.',
            })}
          </p>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.workoutName}</DialogTitle>
                <DialogDescription>
                  {fmt.longDate(selected.completedAt)} · {formatDuration(selected.durationSeconds)} ·{' '}
                  {t('historySessionVolume', {
                    volume: fmt.num(selected.totalVolume),
                    unit: unitLabel,
                    defaultValue: `${fmt.num(selected.totalVolume)} ${unitLabel} total volume`,
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {/* What the coach said when this session finished — persisted by
                    `.184`; sessions completed before then simply have no entry. */}
                {(() => {
                  const entry = getJournalEntry(selected.id);
                  if (!entry || (entry.lines.length === 0 && !entry.fragments?.length)) return null;
                  return (
                    <div className="border-l-2 border-primary/40 pl-3 space-y-1">
                      {/* The athlete's fragments open the entry — their words, verbatim. */}
                      {entry.fragments?.map((fragment, i) => (
                        <p key={`f-${i}`} className="text-sm italic text-foreground">
                          {fragment}
                        </p>
                      ))}
                      {entry.lines
                        .filter((l) => l.kind !== 'question')
                        .map((l, i) => (
                          <p
                            key={`${l.kind}-${i}`}
                            className={
                              l.kind === 'record'
                                ? 'text-sm font-semibold text-poster'
                                : 'text-sm text-muted-foreground'
                            }
                          >
                            {l.text}
                          </p>
                        ))}
                    </div>
                  );
                })()}
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
                      {/* The note the athlete typed mid-session. It was written and
                          synced from day one — and never displayed anywhere until
                          `.184`. A note nobody can re-read is a note nobody writes. */}
                      {ex.note?.trim() ? (
                        <p className="text-sm italic text-muted-foreground border-l-2 border-border pl-3">
                          {ex.note}
                        </p>
                      ) : null}
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
                                  // No per-kind row tint — the WARMUP /
                                  // FAILURE tag says it, same call as
                                  // src/lib/workout/setKind.ts.
                                  kind !== 'normal' && 'bg-card'
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
                                      {fmt.num(set.reps * set.weight)} {unitLabel}
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
