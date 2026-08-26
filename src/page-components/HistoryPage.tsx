'use client';
/**
 * Page: /history — past workouts
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { Calendar, Dumbbell, History as HistoryIcon, Plus, SearchX, Timer, Trophy } from 'lucide-react';
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
import dynamic from 'next/dynamic';
import { SkeletonBlock } from '@/components/ui/Skeleton';
import { MuscleHeatmap } from '@/components/history/MuscleHeatmap';
import { getJournalEntry } from '@/lib/journal/journalStore';
import { JournalTimeline } from '@/components/history/JournalTimeline';
import { HistoryCalendar } from '@/components/history/HistoryCalendar';
import { HistoryMonthFile } from '@/components/history/HistoryMonthFile';
import { AnatomyHeatMap } from '@/components/history/AnatomyHeatMap';

const History1RMChart = dynamic(
  () => import('@/components/history/HistoryCharts').then((m) => m.History1RMChart),
  { ssr: false, loading: () => <SkeletonBlock className="h-48" label="Loading 1RM chart" /> }
);
const HistoryVolumeChart = dynamic(
  () => import('@/components/history/HistoryCharts').then((m) => m.HistoryVolumeChart),
  { ssr: false, loading: () => <SkeletonBlock className="h-48" label="Loading volume chart" /> }
);
import { resolveExercise } from '@/lib/workout/customExercise';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { formatDuration } from '@/lib/utils';
import { HistorySessionEdit } from '@/components/history/HistorySessionEdit';
import { HistorySessionDelete } from '@/components/history/HistorySessionDelete';
import { HistorySessionRestore } from '@/components/history/HistorySessionRestore';
import { HistorySessionName } from '@/components/history/HistorySessionName';
import { HistorySessionDuration } from '@/components/history/HistorySessionDuration';
import { HistorySessionMove } from '@/components/history/HistorySessionMove';
import { HistorySessionCopy } from '@/components/history/HistorySessionCopy';
import { HistorySessionFile } from '@/components/history/HistorySessionFile';
import { HistoryBackfill } from '@/components/history/HistoryBackfill';
import { HistoryMergeExercises } from '@/components/history/HistoryMergeExercises';
import { HistoryStartFrom } from '@/components/history/HistoryStartFrom';
import { HistoryExport } from '@/components/history/HistoryExport';
import { HistoryImport } from '@/components/history/HistoryImport';
import {
  decideEditSave,
  type FinishedSessionDraft,
} from '@/lib/workout/editFinishedSession';
import {
  decideBackfillSession,
  type BackfillDraft,
} from '@/lib/workout/backfillSession';
import { decideMergeExercises, knownIdsForMerge } from '@/lib/workout/mergeExercises';
import {
  decideDeleteFinishedSession,
  decideRestoreFinishedSession,
} from '@/lib/workout/deleteFinishedSession';
import { newClientId } from '@/lib/workout/clientId';
import {
  build1RMChartData,
  buildMuscleHeatmap,
  buildWeeklyVolumeTimeline,
  historySummaryStats,
  pickChartExerciseId,
} from '@/lib/historyAnalytics';
import {
  daysWithDataCount,
  firstDayWithData,
  sweepDaysWithData,
} from '@/lib/journey/daysWithData';
import { getExercisesWithBenchmarkData } from '@/lib/benchmarks';
import { useWorkoutStore } from '@/store/workoutStore';
import type { CompletedWorkoutLog } from '@/types';
import { getUser, getUserNutritionForDate, type CloudNutritionEntry } from '@/lib/supabase';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { localDateKey, localDateKeyFromIso, localMonthKey, formatLocalDateKey } from '@/lib/time/localDate';
import { templateFromCompletedLog } from '@/lib/workout/historyRetrain';
import { formatLogVolumeDisplay } from '@/lib/workout/volumeDisplay';
import { decideRepeatThisSession } from '@/lib/workout/repeatThisSession';
import { decideMoveSessionDay } from '@/lib/workout/moveSessionDay';
import { decideCopySessionDay } from '@/lib/workout/copySessionDay';
import { historySessionLabel } from '@/lib/workout/nameFinishedSession';
import { useHonorSavedRoutine } from '@/hooks/useHonorSavedRoutine';
import { SaveHonoredRoutineDoor } from '@/components/workout/SaveHonoredRoutineDoor';
import { toast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import { MUSCLE_GROUP_I18N } from '@/lib/muscleGroups';
import {
  deletedSessionLogs,
  liveSessionLogs,
  toSessionHistoryRow,
} from '@/lib/history/sessionHistoryList';
import { decideSearchHistory } from '@/lib/history/searchHistory';
import { decideEmptyDayLog, decideMonthDaySelect } from '@/lib/history/monthTheyOwn';

const HEATMAP_WINDOW_DAYS = 14;

type RangeFilter = '7' | '30' | 'all';
type HistoryTab = 'calendar' | 'exercises' | 'journal';

export function HistoryPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const fmt = useLocaleFormat();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const hasHydrated = useWorkoutStore((s) => s.hasHydrated);
  const loadFromCloud = useWorkoutStore((s) => s.loadFromCloud);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const honor = useHonorSavedRoutine();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const liveHistory = useMemo(() => liveSessionLogs(workoutHistory), [workoutHistory]);
  const deletedHistory = useMemo(() => deletedSessionLogs(workoutHistory), [workoutHistory]);
  const [selected, setSelected] = useState<CompletedWorkoutLog | null>(null);
  const [editing, setEditing] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<FinishedSessionDraft | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [backfillOpen, setBackfillOpen] = useState(false);
  const [backfillDateKey, setBackfillDateKey] = useState('');
  const [mergeOpen, setMergeOpen] = useState(false);
  const [startFromOpen, setStartFromOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const saveEditedHistoryLog = useWorkoutStore((s) => s.saveEditedHistoryLog);
  const saveBackfillLog = useWorkoutStore((s) => s.saveBackfillLog);
  const applyMergedExercises = useWorkoutStore((s) => s.applyMergedExercises);
  const deleteFinishedHistoryLog = useWorkoutStore((s) => s.deleteFinishedHistoryLog);
  const restoreFinishedHistoryLog = useWorkoutStore((s) => s.restoreFinishedHistoryLog);
  const nameFinishedHistoryLog = useWorkoutStore((s) => s.nameFinishedHistoryLog);
  const durationFinishedHistoryLog = useWorkoutStore((s) => s.durationFinishedHistoryLog);
  const moveFinishedHistoryLog = useWorkoutStore((s) => s.moveFinishedHistoryLog);
  const copyFinishedHistoryLog = useWorkoutStore((s) => s.copyFinishedHistoryLog);
  const applyImportedHistory = useWorkoutStore((s) => s.applyImportedHistory);
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);

  const openLog = (log: CompletedWorkoutLog) => {
    setEditing(false);
    setPendingDraft(null);
    setConfirmOpen(false);
    setSelected(log);
  };

  const closeSelected = () => {
    setSelected(null);
    setEditing(false);
    setPendingDraft(null);
    setConfirmOpen(false);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('backfill') === '1') setBackfillOpen(true);
  }, []);

  const openBackfill = () => {
    setBackfillDateKey('');
    setBackfillOpen(true);
    setSelected(null);
    setEditing(false);
  };

  const openMerge = () => {
    setMergeOpen(true);
    setSelected(null);
    setEditing(false);
  };

  const openStartFrom = () => {
    setStartFromOpen(true);
    setSelected(null);
    setEditing(false);
  };

  const openExport = () => {
    setExportOpen(true);
    setSelected(null);
    setEditing(false);
  };

  const openImport = () => {
    setImportOpen(true);
    setSelected(null);
    setEditing(false);
  };

  const openRestore = () => {
    if (deletedHistory.length === 0) return;
    setRestoreOpen(true);
    setSelected(null);
    setEditing(false);
  };

  const requestRestore = (sessionId: string) => {
    const decision = decideRestoreFinishedSession({
      sessionId,
      history: workoutHistory,
      live: activeWorkout,
    });
    if (decision.kind !== 'restore') return;
    const restored = restoreFinishedHistoryLog(decision.sessionId);
    if (restored) {
      setRestoreOpen(false);
      setSelected(restored);
    }
  };

  const requestBackfillSave = (draft: BackfillDraft) => {
    const decision = decideBackfillSession({
      draft,
      todayKey: localDateKey(),
      id: `log-${newClientId()}`,
      clientId: newClientId(),
    });
    if (decision.kind === 'empty') {
      toast({
        title: t('historyBackfillEmpty', { defaultValue: 'Nothing to save' }),
        description: t('historyBackfillEmptyDesc', {
          defaultValue: 'Empty invents nothing — pick a date and the sets you remember.',
        }),
      });
      return;
    }
    const saved = saveBackfillLog(decision.next);
    if (saved) {
      setBackfillOpen(false);
      setSelected(saved);
    }
  };

  const requestEditSave = (draft: FinishedSessionDraft) => {
    const decision = decideEditSave({ original: selected, draft });
    if (decision.kind === 'empty') {
      toast({
        title: t('historyEditEmpty', { defaultValue: 'Nothing to save' }),
        description: t('historyEditEmptyDesc', {
          defaultValue: 'Empty invents nothing — this session stays as it was.',
        }),
      });
      return;
    }
    if (decision.kind === 'noop') {
      setEditing(false);
      return;
    }
    if (decision.kind === 'needs-confirm') {
      setPendingDraft(draft);
      setConfirmOpen(true);
      return;
    }
    const saved = saveEditedHistoryLog(decision.next);
    if (saved) setSelected(saved);
    setEditing(false);
  };

  const confirmEditSave = () => {
    if (!selected || !pendingDraft) {
      setConfirmOpen(false);
      return;
    }
    const decision = decideEditSave({ original: selected, draft: pendingDraft });
    if (decision.kind === 'apply' || decision.kind === 'needs-confirm') {
      const saved = saveEditedHistoryLog(decision.next);
      if (saved) setSelected(saved);
    }
    setConfirmOpen(false);
    setPendingDraft(null);
    setEditing(false);
  };

  /** `.1026` — copy this finished log into the one live Start; never wipe a live session. */
  const retrainFromLog = (log: CompletedWorkoutLog) => {
    const decision = decideRepeatThisSession({ log, active: activeWorkout });
    if (decision.kind === 'empty') return;
    setSelected(null);
    if (decision.kind === 'start') {
      startWorkout(decision.name, decision.exercises);
      track('history_train_again', { exerciseCount: decision.exercises.length });
    }
    router.push('/active');
  };
  const [cloudSynced, setCloudSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pillarWins, setPillarWins] = useState<CloudNutritionEntry[]>([]);
  const [chartExerciseId, setChartExerciseId] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [range, setRange] = useState<RangeFilter>('30');
  const [visibleCount, setVisibleCount] = useState(30);
  const [tab, setTab] = useState<HistoryTab>('calendar');
  const [monthKey, setMonthKey] = useState(() => localMonthKey());
  const [monthDayKey, setMonthDayKey] = useState('');
  const monthDay = useMemo(
    () => decideMonthDaySelect({ dateKey: monthDayKey, history: workoutHistory }),
    [monthDayKey, workoutHistory]
  );
  const emptyDayLog = useMemo(
    () =>
      decideEmptyDayLog({
        dateKey: monthDay.kind === 'none' ? monthDay.dateKey : '',
        todayKey: localDateKey(),
        history: workoutHistory,
      }),
    [monthDay, workoutHistory]
  );

  const openEmptyDayLog = () => {
    if (emptyDayLog.kind !== 'open') return;
    setBackfillDateKey(emptyDayLog.dateKey);
    setBackfillOpen(true);
    setSelected(null);
    setEditing(false);
  };

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
    const cutoff =
      range === 'all'
        ? 0
        : Date.now() - Number(range) * 24 * 60 * 60 * 1000;
    const ranged = liveHistory.filter((log) => {
      if (cutoff && new Date(log.completedAt).getTime() < cutoff) return false;
      return true;
    });
    return decideSearchHistory({
      query: nameQuery,
      rows: ranged,
      dateText: (row) => fmt.longDate(row.completedAt),
      liftName: (id) => resolveExercise(id)?.name,
    });
  }, [liveHistory, nameQuery, range, fmt]);

  const visibleHistory = useMemo(
    () => filteredHistory.slice(0, visibleCount),
    [filteredHistory, visibleCount]
  );

  const weeklyVolume = useMemo(
    () => buildWeeklyVolumeTimeline(liveHistory, 12, i18n.language),
    [liveHistory, i18n.language]
  );
  const heatmapCells = useMemo(
    () => buildMuscleHeatmap(liveHistory, HEATMAP_WINDOW_DAYS),
    [liveHistory]
  );
  const exerciseIds = useMemo(
    () => getExercisesWithBenchmarkData(liveHistory),
    [liveHistory]
  );
  const defaultExerciseId = useMemo(() => pickChartExerciseId(liveHistory), [liveHistory]);
  const activeChartId = chartExerciseId || defaultExerciseId || '';
  const oneRmData = useMemo(
    () => (activeChartId ? build1RMChartData(activeChartId, liveHistory) : []),
    [activeChartId, liveHistory]
  );
  const summary = useMemo(() => historySummaryStats(liveHistory), [liveHistory]);

  /*
   * `.247` — the day set is swept on load rather than written at each log site.
   * Six writers is six chances to miss the seventh, and the failure is silent
   * (`.220`). Depends on `workoutHistory` so a session logged this visit counts
   * without a reload.
   */
  const [dayStats, setDayStats] = useState<{ count: number; first: string | null }>({
    count: 0,
    first: null,
  });
  useEffect(() => {
    sweepDaysWithData(liveHistory.map((w) => w.completedAt));
    setDayStats({ count: daysWithDataCount(), first: firstDayWithData() });
  }, [liveHistory]);

  const briefingLine = useMemo(() => {
    if (liveHistory.length === 0) {
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
  }, [liveHistory.length, summary, t, fmt]);

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

  const sessionLabel = t('historySessionCount', {
    count: liveHistory.length,
    defaultValue: '{{count}} completed session',
  });

  return (
    <PillarPageShell
      icon={HistoryIcon}
      eyebrow={t('historyEyebrow', { defaultValue: 'History' })}
      title={t('historyTitle', { defaultValue: 'Workout History' })}
      subtitle={t('historySubtitle', {
        defaultValue: 'Your history powers Today readiness and Mission Score.',
      })}
    >
      {!hasHydrated ? (
        <SkeletonBlock className="h-32" label="Loading sessions" />
      ) : liveHistory.length === 0 ? (
        <div data-testid="session-history-empty">
          <EmptyState
            icon={Dumbbell}
            illustrationSrc="/brand/mascot/kalligator-invite.webp"
            illustrationAlt=""
            title={t('historyEmptyTitle', { defaultValue: 'No sessions yet' })}
            description={t('historyEmptyDesc', {
              defaultValue: 'Log one set from Today — History fills from what you finish.',
            })}
            actionLabel={t('historyStartWorkout', { defaultValue: 'Open Today' })}
            href="/log"
          />
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full min-h-[44px] tap-target"
            data-testid="session-history-backfill-open"
            onClick={openBackfill}
          >
            {t('historyBackfill', { defaultValue: 'Log a past session' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full min-h-[44px] tap-target"
            data-testid="session-history-merge-open"
            onClick={openMerge}
          >
            {t('historyMerge', { defaultValue: 'Merge duplicate exercises' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full min-h-[44px] tap-target"
            data-testid="session-history-start-from-open"
            onClick={openStartFrom}
          >
            {t('historyStartFrom', { defaultValue: 'Start history from this date' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full min-h-[44px] tap-target"
            data-testid="session-history-export-open"
            onClick={openExport}
          >
            {t('historyExport', { defaultValue: 'Export this diary' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full min-h-[44px] tap-target"
            data-testid="session-history-import-open"
            onClick={openImport}
          >
            {t('historyImport', { defaultValue: 'Import this diary' })}
          </Button>
          {deletedHistory.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full min-h-[44px] tap-target"
              data-testid="session-history-restore-open"
              onClick={openRestore}
            >
              {t('historyRestoreOpen', { defaultValue: 'Deleted sessions' })}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] tap-target"
            data-testid="session-history-backfill-open"
            onClick={openBackfill}
          >
            {t('historyBackfill', { defaultValue: 'Log a past session' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] tap-target"
            data-testid="session-history-merge-open"
            onClick={openMerge}
          >
            {t('historyMerge', { defaultValue: 'Merge duplicate exercises' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] tap-target"
            data-testid="session-history-start-from-open"
            onClick={openStartFrom}
          >
            {t('historyStartFrom', { defaultValue: 'Start history from this date' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] tap-target"
            data-testid="session-history-export-open"
            onClick={openExport}
          >
            {t('historyExport', { defaultValue: 'Export this diary' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] tap-target"
            data-testid="session-history-import-open"
            onClick={openImport}
          >
            {t('historyImport', { defaultValue: 'Import this diary' })}
          </Button>
          {deletedHistory.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[44px] tap-target"
              data-testid="session-history-restore-open"
              onClick={openRestore}
            >
              {t('historyRestoreOpen', { defaultValue: 'Deleted sessions' })}
            </Button>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="search"
              data-testid="session-history-search"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              placeholder={t('historySearchPlaceholder', {
                defaultValue: 'Search sessions (name, date, lift)…',
              })}
              className="sm:flex-1 min-h-[44px]"
              aria-label={t('historySearchPlaceholder', {
                defaultValue: 'Search sessions (name, date, lift)…',
              })}
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
                      ? 'min-h-[44px] tap-target border-2 border-transparent bg-primary-fill px-3 text-xs font-semibold text-primary-foreground'
                      : 'min-h-[44px] tap-target border-2 border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted'
                  }
                >
                  {t(`historyRange${value}`, { defaultValue: label })}
                </button>
              ))}
            </div>
          </div>
          {filteredHistory.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={t('historyNoMatches', { defaultValue: 'No sessions match these filters' })}
              description={t('historyNoMatchesDesc', {
                defaultValue: 'Widen the range or clear search.',
              })}
              actionLabel={t('historyClearFilters', { defaultValue: 'Clear filters' })}
              onAction={() => {
                setNameQuery('');
                setRange('all');
              }}
            />
          ) : (
            <div className="space-y-3" data-testid="session-history-list">
            {visibleHistory.map((log) => {
              const row = toSessionHistoryRow(log);
              if (!row) return null;
              const muscleLine = row.muscles
                .map((g) => t(MUSCLE_GROUP_I18N[g], { defaultValue: g }))
                .join(' · ');
              const setLabel =
                row.setCount === 1
                  ? t('historySetCountOne', { defaultValue: '1 set' })
                  : t('historySetCount', {
                      count: row.setCount,
                      defaultValue: `${row.setCount} sets`,
                    });
              const vol = formatLogVolumeDisplay(log, unitLabel, fmt.num);
              return (
              <Card
                key={log.id}
                className="content-card hover:border-foreground transition-colors"
              >
                <CardContent className="flex items-center justify-between gap-3 py-3 px-4">
                  <button
                    type="button"
                    data-testid="session-history-row"
                    className="min-h-[44px] min-w-0 flex-1 text-left"
                    onClick={() => openLog(log)}
                    aria-label={t('historyOpenLog', {
                      name: historySessionLabel(log, fmt.longDate(row.completedAt)),
                      defaultValue: `Open log: ${historySessionLabel(log, fmt.longDate(row.completedAt))}`,
                    })}
                  >
                    <p className="font-semibold truncate">
                      {historySessionLabel(log, fmt.longDate(row.completedAt))}
                    </p>
                    {log.sessionTitle && log.workoutName && log.sessionTitle !== log.workoutName ? (
                      <p className="text-xs text-muted-foreground truncate">{log.workoutName}</p>
                    ) : null}
                    {muscleLine ? (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{muscleLine}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {fmt.longDate(row.completedAt)}
                      </span>
                      <span>{setLabel}</span>
                      {log.durationSeconds > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {formatDuration(log.durationSeconds)}
                        </span>
                      ) : null}
                      <span>
                        {vol.value} {vol.unit}
                      </span>
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5">
                    {decideRepeatThisSession({ log }).kind !== 'empty' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-[44px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          retrainFromLog(log);
                        }}
                      >
                        {t('historyTrainAgainShort', { defaultValue: 'Again' })}
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-[44px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLog(log);
                      }}
                    >
                      {t('historyDetails', { defaultValue: 'Details' })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              );
            })}
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
            </div>
          )}
        </div>
      )}

      <details className="group border-2 border-border bg-card">
        <summary
          className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden"
          data-testid="history-show-all"
        >
          {t('todayShowAll', { defaultValue: 'Show all' })}
        </summary>
        <div className="space-y-4 border-t-2 border-border p-4">
      <div className="border-2 border-border bg-card px-4 py-3 space-y-1">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">
          {t('historyMissionStory', { defaultValue: 'At a glance' })}
        </p>
        <p className="text-sm text-foreground leading-relaxed">{briefingLine}</p>
        {dayStats.count > 0 && (
          <p className="text-sm text-foreground tabular-nums leading-relaxed">
            {t('historyDaysLogged', {
              count: dayStats.count,
              defaultValue: `${fmt.num(dayStats.count)} days logged`,
            })}
            {dayStats.count > 0 && (
              <>
                {' · '}
                <Link href={`/history/${localDateKey()}`} className="text-primary underline">
                  {t('historyDayToday', { defaultValue: 'replay today' })}
                </Link>
              </>
            )}
            {dayStats.first && (
              <span className="text-muted-foreground">
                {' · '}
                {t('historyDaysSince', {
                  date: formatLocalDateKey(dayStats.first, i18n.language),
                  defaultValue: `since ${formatLocalDateKey(dayStats.first, i18n.language)}`,
                })}
              </span>
            )}
          </p>
        )}
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
            {t('navToday', { defaultValue: 'Today' })}
          </Link>
        </p>
        <p className="mt-1 text-muted-foreground">
          {sessionLabel}
          {syncing && t('historySyncing', { defaultValue: ' — syncing cloud…' })}
          {!syncing && cloudSynced && t('historyCloudMerged', { defaultValue: ' — cloud merged' })}
        </p>
      </div>

          <SegmentedControl
            options={[
              { value: 'calendar' as const, label: t('historyTabCalendar', { defaultValue: 'Calendar' }) },
              { value: 'exercises' as const, label: t('historyTabExercises', { defaultValue: 'Exercises' }) },
              { value: 'journal' as const, label: t('historyTabJournal', { defaultValue: 'Journal' }) },
            ]}
            value={tab}
            onChange={setTab}
            ariaLabel={t('historyTabsLabel', { defaultValue: 'History view' })}
          />
          {tab === 'calendar' ? (
            <div className="space-y-3">
            <HistoryCalendar
              history={workoutHistory}
              loggedKeys={loggedDayKeys}
              selectedKey={monthDayKey}
              onSelectDate={(key) => setMonthDayKey((current) => (current === key ? '' : key))}
              monthKey={monthKey}
              onMonthKeyChange={setMonthKey}
            />
            <HistoryMonthFile monthKey={monthKey} history={workoutHistory} />
            {monthDay.kind === 'none' ? (
              <div className="space-y-2" data-testid="history-month-day-empty">
                <p className="text-[13px] text-muted-foreground">
                  {t('historyCalNothing', { defaultValue: 'Nothing logged' })}
                </p>
                {emptyDayLog.kind === 'open' ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full min-h-[44px] tap-target"
                    data-testid="history-month-day-log"
                    onClick={openEmptyDayLog}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    {t('historyMonthDayLog', { defaultValue: 'Log onto this day' })}
                  </Button>
                ) : null}
              </div>
            ) : null}
            {monthDay.kind === 'day' ? (
              <div className="space-y-3" data-testid="history-month-day-list">
                <p className="text-[13px] text-muted-foreground tabular-nums">
                  {t('historySessionCount', {
                    count: monthDay.rows.length,
                    defaultValue: '{{count}} completed session',
                  })}
                </p>
                {monthDay.rows.map((log) => {
                  const row = toSessionHistoryRow(log);
                  if (!row) return null;
                  return (
                    <button
                      key={log.id}
                      type="button"
                      data-testid="session-history-row"
                      className="min-h-[44px] w-full border-2 border-border bg-card px-4 py-3 text-left tap-target"
                      onClick={() => openLog(log)}
                      aria-label={t('historyOpenLog', {
                        name: historySessionLabel(log, fmt.longDate(row.completedAt)),
                        defaultValue: `Open log: ${historySessionLabel(log, fmt.longDate(row.completedAt))}`,
                      })}
                    >
                      <p className="font-semibold truncate">
                        {historySessionLabel(log, fmt.longDate(row.completedAt))}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fmt.longDate(row.completedAt)}
                        {' · '}
                        {row.setCount === 1
                          ? t('historySetCountOne', { defaultValue: '1 set' })
                          : t('historySetCount', {
                              count: row.setCount,
                              defaultValue: `${row.setCount} sets`,
                            })}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : null}
            </div>
          ) : tab === 'journal' ? (
            <JournalTimeline />
          ) : tab === 'exercises' ? (
            <div className="space-y-4" data-testid="history-exercises">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('historyTrendsDesc', {
                  defaultValue: 'Volume, estimated 1RM, and muscle heatmap',
                })}
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                <HistoryVolumeChart data={weeklyVolume} />
                <div className="space-y-2">
                  {exerciseIds.length > 1 && (
                    <Select value={activeChartId} onValueChange={setChartExerciseId}>
                      <SelectTrigger className="w-full min-h-[44px]">
                        <SelectValue
                          placeholder={t('historySelectExercise', {
                            defaultValue: 'Chart exercise',
                          })}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {exerciseIds.map((id) => {
                          const ex = resolveExercise(id);
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
                    exerciseName={resolveExercise(activeChartId)?.name ?? activeChartId}
                  />
                </div>
              </div>
              <details className="group border-2 border-border bg-card">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  {t('historyHeatmaps', { defaultValue: 'Muscle heatmaps' })}
                </summary>
                <div className="space-y-4 border-t-2 border-border p-4">
                  <AnatomyHeatMap cells={heatmapCells} />
                  <MuscleHeatmap cells={heatmapCells} windowDays={HEATMAP_WINDOW_DAYS} />
                </div>
              </details>
            </div>
          ) : null}

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
                className="text-sm p-3 border-2 border-border bg-card flex justify-between gap-2"
              >
                <span>
                  {w.name}{' '}
                  <span className="text-xs text-muted-foreground">
                    ({fmt.longDate(w.date || new Date().toISOString())})
                  </span>
                </span>
                <Link href="/nutrition" className="text-xs underline min-h-[44px] inline-flex items-center tap-target">
                  {t('historyViewFuel', { defaultValue: 'View in Fuel' })}
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
        </div>
      </details>

      <Dialog open={!!selected} onOpenChange={(open) => !open && closeSelected()}>
        <DialogContent
          className="max-w-lg max-h-[85vh] overflow-y-auto"
          data-testid="session-history-log"
        >
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {historySessionLabel(selected, fmt.longDate(selected.completedAt))}
                </DialogTitle>
                <DialogDescription>
                  {fmt.longDate(selected.completedAt)}
                  {selected.durationSeconds > 0
                    ? ` · ${formatDuration(selected.durationSeconds)}`
                    : ''}{' '}
                  ·{' '}
                  {(() => {
                    const vol = formatLogVolumeDisplay(selected, unitLabel, fmt.num);
                    return t('historySessionVolume', {
                      volume: vol.value,
                      unit: vol.unit,
                      defaultValue: `${vol.value} ${vol.unit} total volume`,
                    });
                  })()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {/* What the coach said when this session finished — persisted by
                    `.184`; sessions completed before then simply have no entry. */}
                {(() => {
                  const entry = getJournalEntry(selected.id);
                  if (!entry || (entry.lines.length === 0 && !entry.fragments?.length)) return null;
                  return (
                    <div className="border-l-2 border-primary pl-3 space-y-1">
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
                {!selected.deletedAt ? (
                  <HistorySessionName
                    key={selected.id}
                    sessionId={selected.id}
                    history={workoutHistory}
                    live={activeWorkout}
                    dateText={fmt.longDate(selected.completedAt)}
                    onSave={(sessionId, title) => {
                      const named = nameFinishedHistoryLog(sessionId, title);
                      if (named) setSelected(named);
                    }}
                  />
                ) : null}
                {!selected.deletedAt ? (
                  <HistorySessionDuration
                    key={`duration-${selected.id}-${selected.durationSeconds}`}
                    sessionId={selected.id}
                    history={workoutHistory}
                    live={activeWorkout}
                    onSave={(sessionId, durationSeconds) => {
                      const edited = durationFinishedHistoryLog(sessionId, durationSeconds);
                      if (edited) setSelected(edited);
                    }}
                  />
                ) : null}
                {!editing && !selected.deletedAt ? (
                  <HistorySessionMove
                    key={`move-${selected.id}-${selected.completedAt}`}
                    sessionId={selected.id}
                    history={workoutHistory}
                    live={activeWorkout}
                    onSave={(sessionId, dateKey) => {
                      const decision = decideMoveSessionDay({
                        sessionId,
                        dateKey,
                        todayKey: localDateKey(),
                        history: workoutHistory,
                        live: activeWorkout,
                      });
                      if (decision.kind !== 'apply') return;
                      const moved = moveFinishedHistoryLog(decision.sessionId, decision.dateKey);
                      if (moved) setSelected(moved);
                    }}
                  />
                ) : null}
                {!editing && !selected.deletedAt ? (
                  <HistorySessionCopy
                    key={`copy-${selected.id}-${selected.completedAt}`}
                    sessionId={selected.id}
                    history={workoutHistory}
                    live={activeWorkout}
                    onSave={(sessionId, dateKey) => {
                      const decision = decideCopySessionDay({
                        sessionId,
                        dateKey,
                        todayKey: localDateKey(),
                        history: workoutHistory,
                        live: activeWorkout,
                      });
                      if (decision.kind !== 'apply') return;
                      copyFinishedHistoryLog(decision.sessionId, decision.dateKey);
                    }}
                  />
                ) : null}
                {selected.deletedAt ? null : (
                <HistorySessionEdit
                  log={selected}
                  unitLabel={unitLabel}
                  editing={editing}
                  onEditingChange={setEditing}
                  onSaveRequest={requestEditSave}
                  confirmOpen={confirmOpen}
                  onConfirm={confirmEditSave}
                  onConfirmCancel={() => {
                    setConfirmOpen(false);
                    setPendingDraft(null);
                  }}
                />
                )}
                {!editing ? (
                  <HistorySessionFile
                    sessionId={selected.id}
                    history={workoutHistory}
                  />
                ) : null}
              </div>
              {/* `.1026` — copy this finished log into the one live Start. */}
              {!editing &&
              !selected.deletedAt &&
              (decideRepeatThisSession({ log: selected }).kind !== 'empty' ||
                templateFromCompletedLog(selected)) ? (
                <div className="pt-2 space-y-2 border-t-2 border-border">
                  {decideRepeatThisSession({ log: selected }).kind !== 'empty' ? (
                    <Button
                      type="button"
                      className="w-full min-h-[44px] primary-action"
                      data-testid="history-repeat-session"
                      onClick={() => retrainFromLog(selected)}
                    >
                      {t('historyRepeatSession', { defaultValue: 'Repeat this session' })}
                    </Button>
                  ) : null}
                  {templateFromCompletedLog(selected) ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full min-h-[44px] tap-target"
                      data-testid="history-save-routine"
                      onClick={() => {
                        const template = templateFromCompletedLog(selected);
                        const opened = honor.requestSave({
                          name: template?.name ?? selected.workoutName,
                          exercises: template?.exercises,
                        });
                        if (opened.kind === 'empty') {
                          toast({
                            title: t('honorSaveEmpty', { defaultValue: 'Nothing to save' }),
                            description: t('honorSaveEmptyDesc', {
                              defaultValue: 'A routine needs a name and at least one lift.',
                            }),
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      {t('honorSaveAsRoutine', { defaultValue: 'Save as routine' })}
                    </Button>
                  ) : null}
                </div>
              ) : null}
              {!editing && selected.deletedAt ? (
                <HistorySessionRestore
                  sessionId={selected.id}
                  history={deletedHistory}
                  live={activeWorkout}
                  onRestore={requestRestore}
                />
              ) : null}
              {!editing && !selected.deletedAt ? (
                <HistorySessionDelete
                  sessionId={selected.id}
                  history={workoutHistory}
                  live={activeWorkout}
                  onConfirm={(sessionId) => {
                    const decision = decideDeleteFinishedSession({
                      sessionId,
                      history: workoutHistory,
                      live: activeWorkout,
                    });
                    if (decision.kind !== 'needs-confirm') return;
                    const deleted = deleteFinishedHistoryLog(decision.sessionId);
                    if (deleted) setSelected(deleted);
                  }}
                />
              ) : null}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={backfillOpen} onOpenChange={(open) => !open && setBackfillOpen(false)}>
        <DialogContent
          className="max-w-lg max-h-[85vh] overflow-y-auto"
          data-testid="session-history-backfill-dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {t('historyBackfillTitle', { defaultValue: 'Log a past session' })}
            </DialogTitle>
            <DialogDescription>
              {t('historyBackfillDesc', {
                defaultValue:
                  'If you trained and never opened the app, log that session with the date it happened. Empty invents nothing.',
              })}
            </DialogDescription>
          </DialogHeader>
          {backfillOpen ? (
            <HistoryBackfill
              key={backfillDateKey || 'overflow'}
              history={liveHistory}
              unitLabel={unitLabel}
              initialDateKey={backfillDateKey}
              onSaveRequest={requestBackfillSave}
              onCancel={() => setBackfillOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={mergeOpen} onOpenChange={(open) => !open && setMergeOpen(false)}>
        <DialogContent
          className="max-w-lg max-h-[85vh] overflow-y-auto"
          data-testid="session-history-merge-dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {t('historyMergeTitle', { defaultValue: 'Merge duplicate exercises' })}
            </DialogTitle>
            <DialogDescription>
              {t('historyMergeDesc', {
                defaultValue:
                  'If you logged the same movement under two names, pick which name to keep. This cannot be undone.',
              })}
            </DialogDescription>
          </DialogHeader>
          {mergeOpen ? (
            <HistoryMergeExercises
              history={liveHistory}
              live={activeWorkout?.exercises ?? null}
              saved={savedWorkouts}
              onConfirm={(sourceId, keeperId) => {
                const decision = decideMergeExercises({
                  sourceId,
                  keeperId,
                  knownIds: knownIdsForMerge({
                    history: liveHistory,
                    live: activeWorkout?.exercises ?? null,
                    saved: savedWorkouts,
                  }),
                });
                if (decision.kind !== 'needs-confirm') return;
                const ok = applyMergedExercises(sourceId, keeperId);
                if (ok) {
                  setMergeOpen(false);
                  toast({
                    title: t('historyMergeDone', { defaultValue: 'Merged' }),
                    description: t('historyMergeDoneDesc', {
                      defaultValue: 'History, PRs, notes, and rest now use the name you kept.',
                    }),
                  });
                }
              }}
              onCancel={() => setMergeOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={startFromOpen} onOpenChange={(open) => !open && setStartFromOpen(false)}>
        <DialogContent
          className="max-w-md max-h-[85vh] overflow-y-auto"
          data-testid="session-history-start-from-dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {t('historyStartFromTitle', { defaultValue: 'Start history from this date' })}
            </DialogTitle>
            <DialogDescription>
              {t('historyStartFromDesc', {
                defaultValue:
                  'Week strip, Coach, and streak start here. Older sessions stay in History. Empty invents nothing.',
              })}
            </DialogDescription>
          </DialogHeader>
          {startFromOpen ? (
            <HistoryStartFrom
              history={liveHistory}
              onApplied={() => setStartFromOpen(false)}
              onEmpty={() => {
                toast({
                  title: t('historyStartFromEmpty', { defaultValue: 'Nothing to fold' }),
                  description: t('historyStartFromEmptyDesc', {
                    defaultValue: 'Empty invents nothing — pick a date that is not in the future.',
                  }),
                });
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={exportOpen} onOpenChange={(open) => !open && setExportOpen(false)}>
        <DialogContent
          className="max-w-md max-h-[85vh] overflow-y-auto"
          data-testid="session-history-export-dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {t('historyExportTitle', { defaultValue: 'Export this diary' })}
            </DialogTitle>
            <DialogDescription>
              {t('historyExportDesc', {
                defaultValue:
                  'Save the sessions you logged as a file. Empty invents nothing. Deleted sessions stay out.',
              })}
            </DialogDescription>
          </DialogHeader>
          {exportOpen ? <HistoryExport history={workoutHistory} /> : null}
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={(open) => !open && setImportOpen(false)}>
        <DialogContent
          className="max-w-md max-h-[85vh] overflow-y-auto"
          data-testid="session-history-import-dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {t('historyImportTitle', { defaultValue: 'Import this diary' })}
            </DialogTitle>
            <DialogDescription>
              {t('historyImportDesc', {
                defaultValue:
                  'Bring back the file you saved. Confirm before it writes. Empty invents nothing.',
              })}
            </DialogDescription>
          </DialogHeader>
          {importOpen ? (
            <HistoryImport
              history={workoutHistory}
              onApply={(next) => {
                applyImportedHistory(next);
                setImportOpen(false);
              }}
              onCancel={() => setImportOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={restoreOpen} onOpenChange={(open) => !open && setRestoreOpen(false)}>
        <DialogContent
          className="max-w-md max-h-[85vh] overflow-y-auto"
          data-testid="session-history-restore-dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {t('historyRestoreTitle', { defaultValue: 'Deleted sessions' })}
            </DialogTitle>
            <DialogDescription>
              {t('historyRestoreDesc', {
                defaultValue:
                  'Restore a session you deleted. Empty invents nothing. A live workout is not this.',
              })}
            </DialogDescription>
          </DialogHeader>
          {restoreOpen ? (
            <HistorySessionRestore
              history={deletedHistory}
              live={activeWorkout}
              onRestore={requestRestore}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <SaveHonoredRoutineDoor
        open={!!honor.door}
        name={honor.door?.draft.name ?? selected?.workoutName ?? ''}
        onNameChange={honor.setName}
        replaceExisting={!!honor.door?.replaceExisting}
        onCancel={honor.cancelSave}
        onConfirm={() => {
          const result = honor.confirmSave();
          if (result.kind === 'added' || result.kind === 'replaced') {
            toast({
              title: t('builderWorkoutSaved', { defaultValue: 'Workout saved' }),
              description: t('builderWorkoutSavedDesc', {
                name: result.name,
                defaultValue: `"${result.name}" is ready to use.`,
              }),
            });
          }
        }}
      />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link
          href="/account"
          className="underline underline-offset-2 hover:text-foreground"
        >
          {t('historySignInFoot', { defaultValue: 'Sign in (optional) to load full cloud history.' })}
        </Link>
      </p>
    </PillarPageShell>
  );
}
