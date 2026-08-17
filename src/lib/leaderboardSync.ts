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

/**
 * 4xx (except 408/429) is done — a signed-out or invalid payload must not retry.
 * 5xx / network throw retries.
 */
export function leaderboardSnapshotDeliveryDone(status: number): boolean {
  if (status === 408 || status === 429) return false;
  if (status >= 200 && status < 300) return true;
  if (status >= 400 && status < 500) return true;
  return false;
}

/** Resolves true when the snapshot is stored (or intentionally skipped). */
export async function pushLeaderboardSnapshot(snap: LeaderboardSnapshot): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return true;
  const user = await getUser();
  if (!user) return true; // signed out — not a failure

  const timeZone =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'UTC';

  let res: Response;
  try {
    res = await fetch('/api/leaderboard/snapshot', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operatorName: snap.operatorName,
        timeZone,
        locale: snap.locale,
        squadCode: snap.squadCode,
      }),
    });
  } catch {
    return false;
  }
  return leaderboardSnapshotDeliveryDone(res.status);
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
