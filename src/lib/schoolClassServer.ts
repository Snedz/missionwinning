import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { tierToScore } from '@/lib/presidentialFitnessTest';

export type ClassStats = {
  code: string;
  className: string | null;
  totalTests: number;
  uniqueAthletes: number;
  tierCounts: Record<string, number>;
};

export type ClassPftEntry = {
  rank: number;
  userId: string;
  athleteLabel: string;
  bestTier: string;
  score: number;
  lastTestAt: string;
};

export async function fetchClassStats(code: string): Promise<ClassStats | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const normalized = code.trim().toUpperCase();
  const { data: classRow } = await admin
    .from('school_classes')
    .select('code, name')
    .eq('code', normalized)
    .maybeSingle();

  const { data: rows, error } = await admin
    .from('fitness_test_results')
    .select('user_id, overall_tier')
    .eq('class_code', normalized);

  if (error) return null;

  const tierCounts: Record<string, number> = {};
  const users = new Set<string>();
  for (const row of rows ?? []) {
    if (row.user_id) users.add(row.user_id);
    const tier = row.overall_tier ?? 'unknown';
    tierCounts[tier] = (tierCounts[tier] ?? 0) + 1;
  }

  return {
    code: normalized,
    className: classRow?.name ?? null,
    totalTests: rows?.length ?? 0,
    uniqueAthletes: users.size,
    tierCounts,
  };
}

export async function upsertSchoolClass(
  code: string,
  name: string,
  userId?: string | null,
  teacherPin?: string | null
) {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false as const, error: 'not_configured' };

  const { error } = await admin.from('school_classes').upsert(
    {
      code: code.toUpperCase(),
      name: name.trim() || 'PE Class',
      created_by: userId ?? null,
      teacher_pin: teacherPin ?? null,
    },
    { onConflict: 'code' }
  );

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function verifyTeacherPin(code: string, pin: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) return false;
  const { data } = await admin
    .from('school_classes')
    .select('teacher_pin')
    .eq('code', code.trim().toUpperCase())
    .maybeSingle();
  if (!data?.teacher_pin) return false;
  return data.teacher_pin === pin.trim();
}

export async function fetchClassPftLeaderboard(code: string): Promise<ClassPftEntry[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const normalized = code.trim().toUpperCase();
  const { data: rows, error } = await admin
    .from('fitness_test_results')
    .select('user_id, overall_tier, completed_at')
    .eq('class_code', normalized)
    .order('completed_at', { ascending: false });

  if (error || !rows?.length) return [];

  const bestByUser = new Map<
    string,
    { tier: string; score: number; lastTestAt: string }
  >();

  for (const row of rows) {
    if (!row.user_id) continue;
    const tier = row.overall_tier ?? 'below';
    const score = tierToScore(tier);
    const existing = bestByUser.get(row.user_id);
    if (!existing || score > existing.score) {
      bestByUser.set(row.user_id, {
        tier,
        score,
        lastTestAt: row.completed_at ?? new Date().toISOString(),
      });
    }
  }

  const userIds = Array.from(bestByUser.keys());
  const { data: names } = await admin
    .from('leaderboard_snapshots')
    .select('user_id, operator_name')
    .in('user_id', userIds);

  const nameByUser = new Map(
    (names ?? []).map((n) => [n.user_id, n.operator_name as string])
  );

  const sorted = userIds
    .map((userId) => {
      const best = bestByUser.get(userId)!;
      return {
        userId,
        athleteLabel: nameByUser.get(userId)?.trim() || 'Athlete',
        bestTier: best.tier,
        score: best.score,
        lastTestAt: best.lastTestAt,
      };
    })
    .sort((a, b) => b.score - a.score || a.athleteLabel.localeCompare(b.athleteLabel));

  return sorted.map((row, i) => ({ rank: i + 1, ...row }));
}
