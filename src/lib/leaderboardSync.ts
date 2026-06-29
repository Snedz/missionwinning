import { supabase, getUser } from '@/lib/supabase';
import type { LeaderboardSnapshot } from '@/lib/leaderboard/types';
import type { CompletedWorkoutLog } from '@/types';
import { computeLocalLeaderboardSnapshot } from '@/lib/leaderboard/computeLocalStats';

export async function pushLeaderboardSnapshot(
  workoutHistory: CompletedWorkoutLog[],
  savedCount: number
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  const user = await getUser();
  if (!user) return;

  const snap = computeLocalLeaderboardSnapshot(workoutHistory, savedCount, user.id);

  const { error } = await supabase.from('leaderboard_snapshots').upsert(
    {
      user_id: user.id,
      operator_name: snap.operatorName,
      mission_score: snap.missionScore,
      training_streak: snap.trainingStreak,
      weekly_volume: snap.weeklyVolume,
      night_sessions: snap.nightSessions,
      region: snap.region,
      country_code: snap.countryCode,
      country_name: snap.countryName,
      locale: snap.locale,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) console.warn('leaderboard sync', error.message);
}

export async function fetchCloudLeaderboardSnapshots(): Promise<LeaderboardSnapshot[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const { data, error } = await supabase
    .from('leaderboard_snapshots')
    .select(
      'user_id, operator_name, mission_score, training_streak, weekly_volume, night_sessions, region, country_code, country_name, locale'
    )
    .order('mission_score', { ascending: false })
    .limit(200);

  if (error || !data) return [];

  return data.map((row) => ({
    userId: row.user_id,
    operatorName: row.operator_name || 'Operator',
    missionScore: row.mission_score ?? 0,
    trainingStreak: row.training_streak ?? 0,
    weeklyVolume: row.weekly_volume ?? 0,
    nightSessions: row.night_sessions ?? 0,
    region: row.region ?? 'Americas',
    countryCode: row.country_code ?? 'US',
    countryName: row.country_name ?? 'United States',
    locale: row.locale ?? 'en',
  }));
}
