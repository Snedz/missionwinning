'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workoutStore';
import { getUser } from '@/lib/supabase';
import { buildRankedLeaderboard } from '@/lib/leaderboard/rank';
import {
  computeLocalLeaderboardSnapshot,
  loadOperatorName,
  saveOperatorName,
  loadSquadCode,
  saveSquadCode,
} from '@/lib/leaderboard/computeLocalStats';
import { fetchCloudLeaderboardSnapshots, pushLeaderboardSnapshot } from '@/lib/leaderboardSync';
import type { LeaderboardBoardId, LeaderboardScope } from '@/lib/leaderboard/types';
import { LeaderboardBoardPicker } from '@/components/leaderboard/LeaderboardBoardPicker';
import { LeaderboardScopeTabs } from '@/components/leaderboard/LeaderboardScopeTabs';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';

export function LeaderboardPage() {
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);

  const [boardId, setBoardId] = useState<LeaderboardBoardId>('mission-score');
  const [scope, setScope] = useState<LeaderboardScope>('global');
  const [cloud, setCloud] = useState<Awaited<ReturnType<typeof fetchCloudLeaderboardSnapshots>>>([]);
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
      const rows = await fetchCloudLeaderboardSnapshots();
      setCloud(rows);
    } finally {
      setSyncing(false);
    }
  }, [workoutHistory, savedWorkouts.length]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const you = useMemo(
    () =>
      computeLocalLeaderboardSnapshot(workoutHistory, savedWorkouts.length, userId),
    [workoutHistory, savedWorkouts.length, userId, operatorName, squadCode]
  );

  const ranked = useMemo(
    () => buildRankedLeaderboard(boardId, scope, { ...you, operatorName, squadCode: squadCode || undefined }, cloud),
    [boardId, scope, you, cloud, operatorName, squadCode]
  );

  const boardTheme = ranked.board.theme;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Trophy className="h-5 w-5" />
            <span className="text-xs uppercase tracking-widest font-medium">Rankings</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
            Compare Mission Operators globally, by region, country, locale, or squad.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => void refresh()}
          disabled={syncing}
        >
          <RefreshCw className={syncing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Sync
        </Button>
      </div>

      <LeaderboardBoardPicker boardId={boardId} onBoardChange={setBoardId} />

      <div
        className={
          boardTheme === 'night'
            ? 'rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-slate-950 to-black p-4 md:p-5'
            : boardTheme === 'dawn'
              ? 'rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/50 via-orange-950/30 to-slate-950 p-4 md:p-5'
              : 'rounded-2xl border border-border/50 bg-card/40 p-4 md:p-5'
        }
      >
        <h2 className="text-lg font-semibold tracking-tight">{ranked.board.title}</h2>
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
          onScopeChange={setScope}
          scopeLabel={ranked.scopeLabel}
        />
        <div className="text-xs text-muted-foreground sm:text-right shrink-0">
          {ranked.totalPlayers.toLocaleString()} operators
          {ranked.yourRank != null && (
            <>
              {' · '}
              <span className="text-emerald-400 font-medium">Your rank #{ranked.yourRank}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Call sign</span>
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
          <span className="text-xs text-muted-foreground">Squad code (for Squad tab)</span>
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

      {scope === 'friends' && !squadCode && (
        <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border/50 p-4">
          Set a squad code above to compare with others using the same code. Try <strong>ALPHA</strong> or{' '}
          <strong>BRAVO</strong> to see demo squad members.
        </p>
      )}

      <LeaderboardTable
        entries={ranked.entries}
        unit={ranked.board.unit}
        yourRank={ranked.yourRank}
      />

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Demo operators fill boards until more members sync. Sign in and tap Sync to publish scores. Rankings
        also update after workouts when signed in.
      </p>
    </div>
  );
}
