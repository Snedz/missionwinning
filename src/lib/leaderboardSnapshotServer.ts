import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { checkDisplayName } from '@/lib/identity/displayName';
import { resolveGeoFromLocale } from '@/lib/leaderboard/regions';
import { zonedDateKey, zonedHour, zonedWeekKey } from '@/lib/leaderboard/athleteCalendar';
import { computeStandingFromLogs } from '@/lib/leaderboard/computeStandingFromLogs';

export type LeaderboardSnapshotSubmit = {
  operatorName?: string;
  timeZone: string;
  locale?: string;
  squadCode?: string;
};

export type StoreLeaderboardSnapshotResult =
  | { ok: true; stored: boolean }
  | { ok: false; status: number };

function displayName(raw: string | undefined): string {
  const name = (raw ?? '').trim();
  if (!name) return 'Mission Operator';
  return checkDisplayName(name).ok ? name : 'Mission Operator';
}

/** Service-role upsert. Caller must have already resolved the session user id. */
export async function storeLeaderboardSnapshot(
  userId: string,
  input: LeaderboardSnapshotSubmit,
  now = new Date()
): Promise<StoreLeaderboardSnapshotResult> {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: true, stored: false };

  const todayKey = zonedDateKey(now, input.timeZone);
  const weekStartKey = zonedWeekKey(now, input.timeZone);
  if (!todayKey || !weekStartKey) return { ok: false, status: 400 };

  const [workoutsRes, nutritionRes, pftRes] = await Promise.all([
    admin
      .from('workout_logs')
      .select('completed_at, total_volume, deleted_at')
      .eq('user_id', userId),
    admin.from('nutrition_logs').select('date, protein').eq('user_id', userId),
    admin
      .from('fitness_test_results')
      .select('overall_tier')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1),
  ]);

  if (workoutsRes.error || nutritionRes.error) {
    console.error(
      '[leaderboard/snapshot] %s',
      workoutsRes.error?.message ?? nutritionRes.error?.message
    );
    return { ok: false, status: 500 };
  }

  const standing = computeStandingFromLogs({
    workouts: (workoutsRes.data ?? []).map((row) => ({
      completedAt: String(row.completed_at ?? ''),
      totalVolume: row.total_volume == null ? null : Number(row.total_volume),
      deletedAt: row.deleted_at ? String(row.deleted_at) : null,
    })),
    nutrition: nutritionRes.data ?? [],
    pftTier: pftRes.data?.[0]?.overall_tier ?? null,
    todayKey,
    weekStartKey,
    dateKeyOf: (iso) => zonedDateKey(new Date(iso), input.timeZone),
    hourOf: (iso) => zonedHour(iso, input.timeZone),
  });

  const geo = resolveGeoFromLocale(input.locale);
  const { error } = await admin.from('leaderboard_snapshots').upsert(
    {
      user_id: userId,
      operator_name: displayName(input.operatorName),
      mission_score: standing.missionScore,
      training_streak: standing.trainingStreak,
      weekly_volume: Math.round(standing.weeklyVolume),
      fuel_days: standing.fuelDays,
      night_sessions: standing.nightSessions,
      dawn_sessions: standing.dawnSessions,
      pft_score: standing.pftScore,
      pft_tier: standing.pftTier ?? null,
      squad_code: input.squadCode?.trim() || null,
      region: geo.region,
      country_code: geo.countryCode,
      country_name: geo.countryName,
      locale: geo.locale,
      updated_at: now.toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('[leaderboard/snapshot] %s', error.message);
    return { ok: false, status: 500 };
  }
  return { ok: true, stored: true };
}
