import { supabase, getUser } from '@/lib/supabase';
import type { LeaderboardBoardId, LeaderboardSnapshot } from '@/lib/leaderboard/types';
import type { CompletedWorkoutLog } from '@/types';
import { computeLocalLeaderboardSnapshot } from '@/lib/leaderboard/computeLocalStats';
import { enqueue, registerHandler } from '@/lib/sync/outbox';
import { isSurfaceEnabled } from '@/lib/surface';

/**
 * Queue a leaderboard snapshot. `delayMs` is accepted for call-site compatibility
 * and ignored — the outbox owns timing.
 *
 * Two things this used to get wrong.
 *
 * **It ran for a parked surface.** `workoutStore` calls this on every completed
 * workout, unconditionally, while `/leaderboard` 404s under the default
 * `NEXT_PUBLIC_SURFACES`. Parking is supposed to mean the surface costs nothing.
 *
 * **It queued the whole history.** The comment here claimed the snapshot was
 * computed at enqueue precisely so that "queuing an entire workout history would
 * bloat device storage" — and then enqueued `{ workoutHistory, savedCount }`, doing
 * the exact thing it described avoiding. `src/lib/sync/INDEX.md` repeated the claim.
 * Every save serialized the athlete's entire log into the outbox, growing without
 * bound. `userId` is only a passthrough field on the snapshot, so it can genuinely
 * be computed here and stamped with the user in the handler.
 */
export function scheduleLeaderboardPush(
  workoutHistory: CompletedWorkoutLog[],
  savedCount: number,
  _delayMs = 2000
): void {
  if (typeof window === 'undefined') return;
  if (!isSurfaceEnabled('leaderboard')) return;
  enqueue('leaderboard.push', 'snapshot', {
    snapshot: computeLocalLeaderboardSnapshot(workoutHistory, savedCount),
  });
}

let registered = false;

/** Idempotent. Called from useOutboxDrain. */
export function registerLeaderboardSyncHandler(): void {
  if (registered) return;
  registered = true;
  registerHandler('leaderboard.push', async (payload) => {
    const p = payload as { snapshot?: LeaderboardSnapshot } | null;
    if (!p?.snapshot) return true; // malformed: dropping beats retrying forever
    return pushLeaderboardSnapshot(p.snapshot);
  });
}

/** Resolves true when the snapshot is stored (or intentionally skipped). */
export async function pushLeaderboardSnapshot(snap: LeaderboardSnapshot): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return true;
  const user = await getUser();
  if (!user) return true; // signed out — not a failure

  const { error } = await supabase.from('leaderboard_snapshots').upsert(
    {
      user_id: user.id,
      operator_name: snap.operatorName,
      mission_score: snap.missionScore,
      training_streak: snap.trainingStreak,
      weekly_volume: snap.weeklyVolume,
      fuel_days: snap.fuelDays,
      night_sessions: snap.nightSessions,
      dawn_sessions: snap.dawnSessions,
      pft_score: snap.pftScore,
      pft_tier: snap.pftTier ?? null,
      squad_code: snap.squadCode || null,
      region: snap.region,
      country_code: snap.countryCode,
      country_name: snap.countryName,
      locale: snap.locale,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.warn('leaderboard sync', error.message);
    return false; // let the outbox retry instead of losing the snapshot
  }
  return true;
}

export async function fetchCloudLeaderboardSnapshots(
  boardId: LeaderboardBoardId = 'mission-score'
): Promise<LeaderboardSnapshot[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const orderColumn =
    boardId === 'presidential-fitness'
      ? 'pft_score'
      : boardId === 'training-streak'
        ? 'training_streak'
        : boardId === 'weekly-volume'
          ? 'weekly_volume'
          : boardId === 'fuel-days'
            ? 'fuel_days'
            : boardId === 'under-the-stars'
              ? 'night_sessions'
              : boardId === 'dawns-early-light'
                ? 'dawn_sessions'
                : 'mission_score';

  const { data, error } = await supabase
    .from('leaderboard_snapshots')
    .select(
      'user_id, operator_name, mission_score, training_streak, weekly_volume, fuel_days, night_sessions, dawn_sessions, pft_score, pft_tier, squad_code, region, country_code, country_name, locale'
    )
    .order(orderColumn, { ascending: false })
    .limit(200);

  if (error || !data) return [];

  return data.map((row) => ({
    userId: row.user_id,
    operatorName: row.operator_name || 'Operator',
    missionScore: row.mission_score ?? 0,
    trainingStreak: row.training_streak ?? 0,
    weeklyVolume: row.weekly_volume ?? 0,
    fuelDays: row.fuel_days ?? 0,
    nightSessions: row.night_sessions ?? 0,
    dawnSessions: row.dawn_sessions ?? 0,
    pftScore: row.pft_score ?? 0,
    pftTier: row.pft_tier ?? undefined,
    squadCode: row.squad_code ?? undefined,
    region: row.region ?? 'Americas',
    countryCode: row.country_code ?? 'US',
    countryName: row.country_name ?? 'United States',
    locale: row.locale ?? 'en',
  }));
}
