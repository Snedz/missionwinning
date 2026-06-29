'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkoutStore } from '@/store/workoutStore';
import { getUser } from '@/lib/supabase';
import { buildRankedLeaderboard } from '@/lib/leaderboard/rank';
import {
  computeLocalLeaderboardSnapshot,
  loadOperatorName,
  saveOperatorName,
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
    () => computeLocalLeaderboardSnapshot(workoutHistory, savedWorkouts.length, userId),
    [workoutHistory, savedWorkouts.length, userId, operatorName]
  );

  const ranked = useMemo(
    () => buildRankedLeaderboard(boardId, scope, { ...you, operatorName }, cloud),
    [boardId, scope, you, cloud, operatorName]
  );

  const isNightBoard = boardId === 'under-the-stars';

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
            Gran Turismo–style boards — compare Mission Operators globally, by region, country, and
            local cohort.
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => void refresh()} disabled={syncing}>
          <RefreshCw className={syncing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Sync
        </Button>
      </div>

      <LeaderboardBoardPicker boardId={boardId} onBoardChange={setBoardId} />

      <div
        className={
          isNightBoard
            ? 'rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-slate-950 to-black p-4 md:p-5'
            : 'rounded-2xl border border-border/50 bg-card/40 p-4 md:p-5'
        }
      >
        <h2 className="text-lg font-semibold tracking-tight">{ranked.board.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{ranked.board.subtitle}</p>
        {ranked.board.flavor && (
          <p className="text-xs text-indigo-200/70 mt-3 leading-relaxed border-l-2 border-indigo-500/40 pl-3 italic">
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

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <label className="text-xs text-muted-foreground shrink-0">Call sign</label>
        <input
          value={operatorName}
          onChange={(e) => setOperatorName(e.target.value)}
          onBlur={() => {
            saveOperatorName(operatorName);
            void refresh();
          }}
          maxLength={24}
          placeholder="Mission Operator"
          className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm"
        />
      </div>

      {scope === 'friends' && ranked.entries.length <= 1 && (
        <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border/50 p-4">
          Friends squad rankings are coming soon. For now, compare on Global, Regional, National, or
          Local boards.
        </p>
      )}

      <LeaderboardTable
        entries={ranked.entries}
        unit={ranked.board.unit}
        yourRank={ranked.yourRank}
      />

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Demo operators fill boards until more members sync. Sign in to publish your scores to the
        cloud. Rankings refresh when you tap Sync or finish a workout. Civilian fitness app — not
        affiliated with any military service.
      </p>
    </div>
  );
}
