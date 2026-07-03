'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Trophy, RefreshCw, Moon, Sunrise } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workoutStore';
import { getUser } from '@/lib/supabase';
import { buildRankedLeaderboard, type ClassLeaderboardRow } from '@/lib/leaderboard/rank';
import {
  computeLocalLeaderboardSnapshot,
  loadOperatorName,
  saveOperatorName,
  loadSquadCode,
  saveSquadCode,
} from '@/lib/leaderboard/computeLocalStats';
import { fetchCloudLeaderboardSnapshots, pushLeaderboardSnapshot } from '@/lib/leaderboardSync';
import type { LeaderboardBoardId, LeaderboardScope } from '@/lib/leaderboard/types';
import { parseLeaderboardBoardId, parseLeaderboardScope } from '@/lib/leaderboard/types';
import { BOARD_I18N_KEY } from '@/i18n/leaderboardLocales';
import { LeaderboardBoardPicker } from '@/components/leaderboard/LeaderboardBoardPicker';
import { LeaderboardScopeTabs } from '@/components/leaderboard/LeaderboardScopeTabs';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { getJoinedClassCode } from '@/lib/schoolClass';

export function LeaderboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);

  const [boardId, setBoardId] = useState<LeaderboardBoardId>(() => {
    return parseLeaderboardBoardId(searchParams.get('board')) ?? 'mission-score';
  });
  const [scope, setScope] = useState<LeaderboardScope>(() => {
    return parseLeaderboardScope(searchParams.get('scope')) ?? 'global';
  });
  const [cloud, setCloud] = useState<Awaited<ReturnType<typeof fetchCloudLeaderboardSnapshots>>>([]);
  const [classRows, setClassRows] = useState<ClassLeaderboardRow[]>([]);
  const [classCode, setClassCode] = useState('');
  const [operatorName, setOperatorName] = useState(loadOperatorName);
  const [squadCode, setSquadCode] = useState(loadSquadCode);
  const [syncing, setSyncing] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    setSyncing(true);
    try {
      const u = await getUser();
      setUserId(u?.id);
      await pushLeaderboardSnapshot(workoutHistory, savedWorkouts.length);
      const rows = await fetchCloudLeaderboardSnapshots(boardId);
      setCloud(rows);
      const joined = getJoinedClassCode();
      const activeClass = scope === 'class' ? classCode || joined : joined;
      if (scope === 'class' && activeClass) {
        setClassCode(activeClass);
        try {
          const res = await fetch(`/api/school/class/${activeClass}/leaderboard`);
          const data = (await res.json()) as { entries?: ClassLeaderboardRow[] };
          setClassRows(data.entries ?? []);
        } catch {
          setClassRows([]);
        }
      } else if (scope !== 'class') {
        setClassRows([]);
      }
    } finally {
      setSyncing(false);
    }
  }, [workoutHistory, savedWorkouts.length, boardId, scope, classCode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const joined = getJoinedClassCode();
    if (joined && !loadSquadCode()) {
      saveSquadCode(joined);
      setSquadCode(joined);
    }
    if (joined) setClassCode(joined);
    if (joined && !searchParams.get('scope')) {
      setScope(boardId === 'presidential-fitness' ? 'class' : 'friends');
    }
  }, [searchParams, boardId]);

  useEffect(() => {
    const nextBoard = parseLeaderboardBoardId(searchParams.get('board'));
    const nextScope = parseLeaderboardScope(searchParams.get('scope'));
    const urlClass = searchParams.get('class')?.toUpperCase();
    if (nextBoard) setBoardId(nextBoard);
    if (nextScope) setScope(nextScope);
    if (urlClass) setClassCode(urlClass);
  }, [searchParams]);

  const updateUrl = useCallback(
    (nextBoard: LeaderboardBoardId, nextScope: LeaderboardScope) => {
      const params = new URLSearchParams();
      if (nextBoard !== 'mission-score') params.set('board', nextBoard);
      if (nextScope !== 'global') params.set('scope', nextScope);
      const joined = getJoinedClassCode();
      if (nextScope === 'class' && joined) params.set('class', joined);
      const qs = params.toString();
      router.replace(qs ? `/leaderboard?${qs}` : '/leaderboard', { scroll: false });
    },
    [router]
  );

  const handleBoardChange = useCallback(
    (id: LeaderboardBoardId) => {
      setBoardId(id);
      updateUrl(id, scope);
    },
    [scope, updateUrl]
  );

  const handleScopeChange = useCallback(
    (next: LeaderboardScope) => {
      setScope(next);
      updateUrl(boardId, next);
    },
    [boardId, updateUrl]
  );

  const you = useMemo(
    () =>
      computeLocalLeaderboardSnapshot(workoutHistory, savedWorkouts.length, userId),
    [workoutHistory, savedWorkouts.length, userId, operatorName, squadCode]
  );

  const ranked = useMemo(
    () =>
      buildRankedLeaderboard(
        boardId,
        scope,
        { ...you, operatorName, squadCode: squadCode || undefined, userId },
        cloud,
        { classCode: classCode || undefined, classRows }
      ),
    [boardId, scope, you, cloud, operatorName, squadCode, userId, classCode, classRows]
  );

  const boardTheme = ranked.board.theme;
  const boardTitle = t(BOARD_I18N_KEY[boardId], { defaultValue: ranked.board.title });

  return (
    <PillarPageShell
      icon={Trophy}
      title={t('leaderboardTitle', { defaultValue: 'Leaderboard' })}
      subtitle={t('leaderboardSubtitle', {
        defaultValue:
          'Compare Mission Operators globally, by region, country, locale, or squad.',
      })}
      className="pb-8"
      headerActions={
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => void refresh()}
          disabled={syncing}
        >
          <RefreshCw className={syncing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          {t('leaderboardSync', { defaultValue: 'Sync' })}
        </Button>
      }
    >
      <LeaderboardBoardPicker boardId={boardId} onBoardChange={handleBoardChange} />

      {(you.nightSessions > 0 || you.dawnSessions > 0) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {you.nightSessions > 0 && (
            <button
              type="button"
              onClick={() => handleBoardChange('under-the-stars')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors',
                boardId === 'under-the-stars'
                  ? 'border-indigo-500/50 bg-indigo-950/50 text-indigo-200'
                  : 'border-border/50 text-muted-foreground hover:border-indigo-500/30'
              )}
            >
              <Moon className="h-3.5 w-3.5" />
              {you.nightSessions}{' '}
              {t('lbNightSessions', { defaultValue: 'night sessions' })}
            </button>
          )}
          {you.dawnSessions > 0 && (
            <button
              type="button"
              onClick={() => handleBoardChange('dawns-early-light')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors',
                boardId === 'dawns-early-light'
                  ? 'border-amber-500/50 bg-amber-950/40 text-amber-200'
                  : 'border-border/50 text-muted-foreground hover:border-amber-500/30'
              )}
            >
              <Sunrise className="h-3.5 w-3.5" />
              {you.dawnSessions}{' '}
              {t('lbDawnSessions', { defaultValue: 'dawn sessions' })}
            </button>
          )}
        </div>
      )}

      <div
        className={
          boardTheme === 'night'
            ? 'rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-slate-950 to-black p-4 md:p-5'
            : boardTheme === 'dawn'
              ? 'rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/50 via-orange-950/30 to-slate-950 p-4 md:p-5'
              : 'rounded-2xl border border-border/50 bg-card/40 p-4 md:p-5'
        }
      >
        <h2 className="text-lg font-semibold tracking-tight">{boardTitle}</h2>
        <p className="text-sm text-muted-foreground mt-1">{ranked.board.subtitle}</p>
        {ranked.board.flavor && (
          <p
            className={cn(
              'text-xs mt-3 leading-relaxed border-l-2 pl-3 italic',
              boardTheme === 'night' && 'text-indigo-200/70 border-indigo-500/40',
              boardTheme === 'dawn' && 'text-amber-200/80 border-amber-500/40'
            )}
          >
            {ranked.board.flavor}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
        <LeaderboardScopeTabs
          scope={scope}
          onScopeChange={handleScopeChange}
          scopeLabel={ranked.scopeLabel}
        />
        <div className="text-xs text-muted-foreground sm:text-right shrink-0">
          {ranked.totalPlayers.toLocaleString()} {t('leaderboardOperators', { defaultValue: 'operators' })}
          {ranked.yourRank != null && (
            <>
              {' · '}
              <span className="text-emerald-400 font-medium">
                {t('leaderboardYourRank', { defaultValue: 'Your rank' })} #{ranked.yourRank}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">
            {t('leaderboardCallSign', { defaultValue: 'Call sign' })}
          </span>
          <input
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
            onBlur={() => {
              saveOperatorName(operatorName);
              void refresh();
            }}
            maxLength={24}
            placeholder="Mission Operator"
            className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">
            {t('leaderboardSquadCode', { defaultValue: 'Squad code (for Squad tab)' })}
          </span>
          <input
            value={squadCode}
            onChange={(e) => setSquadCode(e.target.value.toUpperCase())}
            onBlur={() => {
              saveSquadCode(squadCode);
              void refresh();
            }}
            maxLength={8}
            placeholder="e.g. ALPHA"
            className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm font-mono uppercase"
          />
        </label>
      </div>

      {scope === 'class' && !classCode && (
        <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border/50 p-4">
          {t('leaderboardClassScopeHint', {
            defaultValue:
              'Join a PE class on /america to see class standings here. Class board uses signed-in fitness test results.',
          })}
        </p>
      )}

      {scope === 'friends' && !squadCode && (
        <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border/50 p-4">
          {t('leaderboardSquadHint', {
            defaultValue:
              'Set a squad code above to compare with others using the same code. Try ALPHA or BRAVO to see demo squad members.',
          })}
        </p>
      )}

      {scope === 'friends' && squadCode.startsWith('MW') && (
        <p className="text-xs text-blue-400/90 rounded-lg border border-blue-500/20 bg-blue-950/20 px-3 py-2">
          {t('leaderboardClassHint', {
            defaultValue:
              'PE class code active — squad rankings include classmates who sync while signed in.',
          })}
        </p>
      )}

      <LeaderboardTable
        entries={ranked.entries}
        unit={ranked.board.unit}
        yourRank={ranked.yourRank}
        theme={boardTheme}
      />

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        {scope === 'class'
          ? t('leaderboardClassNote', {
              defaultValue:
                'Class standings rank best signed-in fitness test per athlete. Demo operators are hidden on this board.',
            })
          : t('leaderboardDemoNote', {
              defaultValue:
                'Rows marked Pacer are virtual pace-setters, not real athletes — they keep boards motivating while the community grows. Sign in and tap Sync to publish your score.',
            })}
      </p>
    </PillarPageShell>
  );
}
