import 'server-only';
/**
 * Server mint for Mission ID. Service-role writes only.
 *
 * The client may GET `/api/account/mission-id`. It may not choose an integer.
 */
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { isBetaAdminEmail } from '@/lib/betaMetricsServer';
import {
  decideMissionIdClaim,
  githubLoginFromAuthUser,
  isFounderForMissionId1,
} from '@/lib/identity/missionId';

function asMissionId(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) return null;
  return value;
}

export async function readMissionId(
  admin: SupabaseClient,
  userId: string
): Promise<number | null> {
  const { data, error } = await admin
    .from('mission_ids')
    .select('mission_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return asMissionId(data?.mission_id);
}

async function isMissionId1TakenByOther(
  admin: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await admin
    .from('mission_ids')
    .select('user_id')
    .eq('mission_id', 1)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.user_id && data.user_id !== userId);
}

async function insertMissionId(
  admin: SupabaseClient,
  userId: string,
  missionId: number
): Promise<'ok' | 'conflict'> {
  const { error } = await admin.from('mission_ids').insert({
    user_id: userId,
    mission_id: missionId,
  });
  if (!error) return 'ok';
  if (error.code === '23505') return 'conflict';
  throw error;
}

async function nextSequentialId(admin: SupabaseClient): Promise<number> {
  const { data, error } = await admin.rpc('mw_next_mission_id');
  if (error) throw error;
  const n = asMissionId(typeof data === 'number' ? data : Number(data));
  if (n == null || n < 2) {
    throw new Error('sequence_invalid');
  }
  return n;
}

export function founderFromAuthUser(user: User): boolean {
  return isFounderForMissionId1({
    githubLogin: githubLoginFromAuthUser(user),
    emailIsBetaAdmin: isBetaAdminEmail(user.email),
  });
}

/**
 * Idempotent claim. Returns the athlete's Mission ID.
 * Caller must have already verified a session — never pass a client-supplied id.
 */
export async function claimMissionIdForUser(
  admin: SupabaseClient,
  user: User
): Promise<number> {
  if (!user.id) throw new Error('unsigned');

  const existing = await readMissionId(admin, user.id);
  const decision = decideMissionIdClaim({
    signedIn: true,
    existing,
    isFounder: founderFromAuthUser(user),
    id1TakenByOther: existing == null ? await isMissionId1TakenByOther(admin, user.id) : true,
  });

  if (decision.kind === 'none') throw new Error('unsigned');
  if (decision.kind === 'keep') return decision.missionId;

  if (decision.kind === 'founder-1') {
    const inserted = await insertMissionId(admin, user.id, 1);
    if (inserted === 'ok') return 1;
    const mine = await readMissionId(admin, user.id);
    if (mine != null) return mine;
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    const next = await nextSequentialId(admin);
    const inserted = await insertMissionId(admin, user.id, next);
    if (inserted === 'ok') return next;
    const mine = await readMissionId(admin, user.id);
    if (mine != null) return mine;
  }
  throw new Error('claim_failed');
}
