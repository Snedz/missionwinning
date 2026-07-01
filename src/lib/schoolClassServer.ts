import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export type ClassStats = {
  code: string;
  className: string | null;
  totalTests: number;
  uniqueAthletes: number;
  tierCounts: Record<string, number>;
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

export async function upsertSchoolClass(code: string, name: string, userId?: string | null) {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false as const, error: 'not_configured' };

  const { error } = await admin.from('school_classes').upsert(
    {
      code: code.toUpperCase(),
      name: name.trim() || 'PE Class',
      created_by: userId ?? null,
    },
    { onConflict: 'code' }
  );

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
