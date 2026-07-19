/**
 * Wearable connection + sample persistence (service-role).
 * Auth: session routes only | See: docs/WEARABLES.md
 */
import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { WearableOAuthProviderId, WearableProviderId, WearableSample } from './types';
import type { OAuthTokenSet } from './adapter';

export type ConnectionRow = {
  id: string;
  user_id: string;
  provider: string;
  status: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  scopes: string | null;
  account_label: string | null;
  last_sync_at: string | null;
  metadata: Record<string, unknown> | null;
};

export function getWearablesAdmin() {
  return getSupabaseAdmin();
}

export async function listConnections(userId: string): Promise<ConnectionRow[]> {
  const admin = getWearablesAdmin();
  if (!admin) return [];
  const { data, error } = await admin
    .from('wearable_connections')
    .select('*')
    .eq('user_id', userId);
  if (error || !data) return [];
  return data as ConnectionRow[];
}

export async function upsertOAuthConnection(args: {
  userId: string;
  provider: WearableOAuthProviderId;
  tokens: OAuthTokenSet;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = getWearablesAdmin();
  if (!admin) return { ok: false, error: 'Database not configured' };

  const { error } = await admin.from('wearable_connections').upsert(
    {
      user_id: args.userId,
      provider: args.provider,
      status: 'connected',
      access_token: args.tokens.accessToken,
      refresh_token: args.tokens.refreshToken ?? null,
      token_expires_at: args.tokens.expiresAt ?? null,
      scopes: args.tokens.scopes ?? null,
      account_label: args.tokens.accountLabel ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,provider' }
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function disconnectProvider(
  userId: string,
  provider: WearableProviderId,
  deleteSamples: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = getWearablesAdmin();
  if (!admin) return { ok: false, error: 'Database not configured' };

  const { error } = await admin
    .from('wearable_connections')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider);
  if (error) return { ok: false, error: error.message };

  if (deleteSamples) {
    await admin.from('wearable_samples').delete().eq('user_id', userId).eq('source', provider);
  }
  return { ok: true };
}

export async function insertSamples(
  userId: string,
  samples: WearableSample[]
): Promise<{ inserted: number; error?: string }> {
  if (!samples.length) return { inserted: 0 };
  const admin = getWearablesAdmin();
  if (!admin) return { inserted: 0, error: 'Database not configured' };

  const rows = samples.map((s) => ({
    user_id: userId,
    source: s.source,
    kind: s.kind,
    started_at: s.startedAt,
    ended_at: s.endedAt ?? null,
    external_id: s.externalId,
    metrics: s.metrics ?? {},
    raw_summary: s.rawSummary ?? null,
  }));

  const { data, error } = await admin
    .from('wearable_samples')
    .upsert(rows, { onConflict: 'user_id,source,external_id', ignoreDuplicates: false })
    .select('id');

  if (error) return { inserted: 0, error: error.message };
  return { inserted: data?.length ?? rows.length };
}

export async function markSynced(userId: string, provider: WearableProviderId): Promise<void> {
  const admin = getWearablesAdmin();
  if (!admin) return;
  await admin
    .from('wearable_connections')
    .update({ last_sync_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('provider', provider);
}

export { samplesToActivityHints } from './mapSamples';
