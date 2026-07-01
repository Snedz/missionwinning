import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { tierToScore } from '@/lib/presidentialFitnessTest';
import { authorizeSchoolClassUpsert, type SchoolClassRow } from '@/lib/schoolClassAuth';
import { formatClassStandingsCsv } from '@/lib/schoolClassExport';
import {
  hashTeacherPin,
  isHashedTeacherPin,
  verifyTeacherPinValue,
} from '@/lib/teacherPinCrypto';

export { formatClassStandingsCsv };

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

export type TeacherClassSummary = {
  code: string;
  name: string;
  teacherPin: string | null;
  createdAt: string;
};

export async function fetchSchoolClass(code: string): Promise<SchoolClassRow | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const normalized = code.trim().toUpperCase();
  const { data } = await admin
    .from('school_classes')
    .select('code, name, created_by, teacher_pin')
    .eq('code', normalized)
    .maybeSingle();

  if (!data) return null;
  return {
    code: data.code,
    name: data.name,
    created_by: data.created_by ?? null,
    teacher_pin: data.teacher_pin ?? null,
  };
}

export async function isClassCreator(code: string, userId: string): Promise<boolean> {
  const row = await fetchSchoolClass(code);
  return Boolean(row?.created_by && row.created_by === userId);
}

export async function fetchTeacherClasses(userId: string): Promise<TeacherClassSummary[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data, error } = await admin
    .from('school_classes')
    .select('code, name, teacher_pin, created_at')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) return [];

  return data.map((row) => ({
    code: row.code,
    name: row.name,
    teacherPin: null,
    createdAt: row.created_at ?? new Date().toISOString(),
  }));
}

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
  userId: string,
  teacherPin?: string | null
): Promise<{ ok: true } | { ok: false; error: string; status?: number }> {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, error: 'not_configured' };

  const normalized = code.toUpperCase();
  const existing = await fetchSchoolClass(normalized);

  let pinVerified = false;
  if (existing?.teacher_pin && teacherPin?.trim()) {
    pinVerified = await verifyTeacherPinValue(existing.teacher_pin, teacherPin);
  } else if (!existing?.teacher_pin) {
    pinVerified = true;
  } else if (existing.created_by === userId) {
    pinVerified = true;
  }

  const auth = authorizeSchoolClassUpsert(existing, userId, { pinVerified });
  if (!auth.allowed) {
    return {
      ok: false,
      error: auth.reason,
      status: 403,
    };
  }

  const payload: Record<string, string | null> = {
    code: normalized,
    name: name.trim() || 'PE Class',
    created_by: existing?.created_by ?? userId,
  };
  if (auth.claimCreator || !existing?.created_by) {
    payload.created_by = userId;
  }
  if (teacherPin?.trim()) {
    payload.teacher_pin = await hashTeacherPin(teacherPin.trim());
  }

  const { error } = await admin.from('school_classes').upsert(payload, { onConflict: 'code' });

  if (error) return { ok: false, error: error.message, status: 500 };
  return { ok: true };
}

export async function verifyTeacherPin(code: string, pin: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) return false;
  const normalized = code.trim().toUpperCase();
  const { data } = await admin
    .from('school_classes')
    .select('teacher_pin')
    .eq('code', normalized)
    .maybeSingle();
  if (!data?.teacher_pin) return false;

  const ok = await verifyTeacherPinValue(data.teacher_pin, pin);
  if (ok && !isHashedTeacherPin(data.teacher_pin)) {
    void admin
      .from('school_classes')
      .update({ teacher_pin: await hashTeacherPin(pin.trim()) })
      .eq('code', normalized);
  }
  return ok;
}

/** Teacher dashboard access — creator or valid PIN. */
export async function canAccessTeacherDashboard(
  code: string,
  userId: string | null,
  pin?: string | null
): Promise<{ unlocked: boolean; isCreator: boolean }> {
  if (userId && (await isClassCreator(code, userId))) {
    return { unlocked: true, isCreator: true };
  }
  if (pin?.trim() && (await verifyTeacherPin(code, pin))) {
    return { unlocked: true, isCreator: false };
  }
  return { unlocked: false, isCreator: false };
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
