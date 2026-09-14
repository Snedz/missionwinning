import 'server-only';

/**
 * Service-role read/write for staged-rollout flags.
 *
 * Admin GET 503s when the table or service role is missing — never an empty
 * catalog (`.214`). Athlete evaluate then uses catalog defaults.
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { FEATURE_FLAG_CATALOG, catalogEntry, isFeatureFlagKey } from './catalog';
import {
  clampPercent,
  evaluateAllFlags,
  evaluateFlag,
  parseAllowlist,
  type FlagDecision,
  type FlagOverride,
  type FlagSubject,
} from './evaluate';

export type FlagEventKind = 'percent' | 'allowlist' | 'kill' | 'unkill';

export type AdminFlagRow = {
  key: string;
  title: string;
  description: string;
  percent: number;
  killed: boolean;
  allowlist: string[];
  updatedAt: string | null;
  updatedBy: string | null;
};

export type AdminFlagEvent = {
  id: number;
  flagKey: string;
  kind: FlagEventKind;
  payload: unknown;
  actor: string;
  createdAt: string;
};

export type LoadFlagsResult =
  | { ok: true; flags: AdminFlagRow[]; events: AdminFlagEvent[] }
  | { ok: false; error: 'no_service_role' | 'unavailable' | 'query_failed' };

export type PatchFlagInput = {
  key: string;
  percent?: number;
  killed?: boolean;
  allowlist?: string[];
  actor: string;
};

export type PatchFlagResult =
  | { ok: true; flag: AdminFlagRow }
  | {
      ok: false;
      error:
        | 'unknown_key'
        | 'invalid_allowlist'
        | 'nothing_to_update'
        | 'no_service_role'
        | 'unavailable'
        | 'query_failed';
    };

function isMissingRelation(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  const code = error.code ?? '';
  if (code === '42P01' || code === 'PGRST205') return true;
  return /feature_flag_overrides|feature_flag_events|does not exist/i.test(error.message ?? '');
}

function asOverride(row: {
  percent?: unknown;
  killed?: unknown;
  allowlist?: unknown;
}): FlagOverride {
  return {
    percent: clampPercent(typeof row.percent === 'number' ? row.percent : Number(row.percent)),
    killed: row.killed === true,
    allowlist: parseAllowlist(row.allowlist) ?? [],
  };
}

function catalogRow(entry: (typeof FEATURE_FLAG_CATALOG)[number], override: FlagOverride | null, meta?: {
  updatedAt: string | null;
  updatedBy: string | null;
}): AdminFlagRow {
  return {
    key: entry.key,
    title: entry.title,
    description: entry.description,
    percent: override?.percent ?? entry.defaultPercent,
    killed: override?.killed === true,
    allowlist: override?.allowlist ?? [],
    updatedAt: meta?.updatedAt ?? null,
    updatedBy: meta?.updatedBy ?? null,
  };
}

function isEventKind(raw: string): raw is FlagEventKind {
  return raw === 'percent' || raw === 'allowlist' || raw === 'kill' || raw === 'unkill';
}

async function readOverrideMap(): Promise<
  | { ok: true; byKey: Map<string, { override: FlagOverride; updatedAt: string | null; updatedBy: string | null }> }
  | { ok: false; error: 'no_service_role' | 'unavailable' | 'query_failed' }
> {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, error: 'no_service_role' };

  const { data, error } = await admin
    .from('feature_flag_overrides')
    .select('flag_key, percent, killed, allowlist, updated_at, updated_by');

  if (error) {
    if (isMissingRelation(error)) return { ok: false, error: 'unavailable' };
    console.error('[flags] override read failed');
    return { ok: false, error: 'query_failed' };
  }

  const byKey = new Map<string, { override: FlagOverride; updatedAt: string | null; updatedBy: string | null }>();
  for (const row of data ?? []) {
    const key = String(row.flag_key ?? '');
    if (!isFeatureFlagKey(key)) continue;
    byKey.set(key, {
      override: asOverride(row),
      updatedAt: typeof row.updated_at === 'string' ? row.updated_at : null,
      updatedBy: typeof row.updated_by === 'string' ? row.updated_by : null,
    });
  }
  return { ok: true, byKey };
}

export async function loadAdminFlags(): Promise<LoadFlagsResult> {
  const loaded = await readOverrideMap();
  if (!loaded.ok) return loaded;

  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, error: 'no_service_role' };

  const { data: eventRows, error: eventError } = await admin
    .from('feature_flag_events')
    .select('id, flag_key, kind, payload, actor, created_at')
    .order('created_at', { ascending: false })
    .limit(40);

  if (eventError) {
    if (isMissingRelation(eventError)) return { ok: false, error: 'unavailable' };
    console.error('[flags] event read failed');
    return { ok: false, error: 'query_failed' };
  }

  const flags = FEATURE_FLAG_CATALOG.map((entry) => {
    const hit = loaded.byKey.get(entry.key);
    return catalogRow(entry, hit?.override ?? null, {
      updatedAt: hit?.updatedAt ?? null,
      updatedBy: hit?.updatedBy ?? null,
    });
  });

  const events: AdminFlagEvent[] = [];
  for (const row of eventRows ?? []) {
    const kind = String(row.kind ?? '');
    if (!isEventKind(kind)) continue;
    const id = typeof row.id === 'number' ? row.id : Number(row.id);
    if (!Number.isFinite(id)) continue;
    events.push({
      id,
      flagKey: String(row.flag_key ?? ''),
      kind,
      payload: row.payload ?? {},
      actor: String(row.actor ?? ''),
      createdAt: String(row.created_at ?? ''),
    });
  }

  return { ok: true, flags, events };
}

/** Athlete evaluate. Missing table / no service role → catalog defaults, never 503. */
export async function evaluateFlagsForSubject(subject: FlagSubject): Promise<Record<string, boolean>> {
  const loaded = await readOverrideMap();
  const overrides = new Map<string, FlagOverride>();
  if (loaded.ok) {
    for (const [key, hit] of loaded.byKey) {
      overrides.set(key, hit.override);
    }
  } else if (loaded.error === 'query_failed') {
    console.error('[flags] evaluate fell back to catalog defaults');
  }
  return evaluateAllFlags(subject, overrides);
}

export async function previewFlag(key: string, subjectRaw: string): Promise<
  | { ok: true; decision: FlagDecision }
  | { ok: false; error: 'unknown_key' | 'invalid_subject' | 'no_service_role' | 'unavailable' | 'query_failed' }
> {
  if (!isFeatureFlagKey(key)) return { ok: false, error: 'unknown_key' };
  const parsed = parseAllowlist([subjectRaw]);
  if (!parsed || parsed.length !== 1) return { ok: false, error: 'invalid_subject' };
  const token = parsed[0]!;

  const loaded = await readOverrideMap();
  if (!loaded.ok) return loaded;

  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, error: 'no_service_role' };

  let subject: FlagSubject;
  if (token.includes('@')) {
    const { data, error } = await admin.from('profiles').select('id, email').eq('email', token).maybeSingle();
    if (error && isMissingRelation(error)) return { ok: false, error: 'unavailable' };
    const userId = typeof data?.id === 'string' && data.id.length > 0 ? data.id : token;
    subject = { userId, email: token };
  } else {
    const { data, error } = await admin.from('profiles').select('id, email').eq('id', token).maybeSingle();
    if (error && isMissingRelation(error)) return { ok: false, error: 'unavailable' };
    const email = typeof data?.email === 'string' ? data.email : null;
    subject = { userId: token, email };
  }

  const hit = loaded.byKey.get(key);
  return { ok: true, decision: evaluateFlag(key, subject, hit?.override ?? null) };
}

export async function patchFlag(input: PatchFlagInput): Promise<PatchFlagResult> {
  const entry = catalogEntry(input.key);
  if (!entry) return { ok: false, error: 'unknown_key' };

  if (input.percent === undefined && input.killed === undefined && input.allowlist === undefined) {
    return { ok: false, error: 'nothing_to_update' };
  }

  let nextAllowlist: string[] | undefined;
  if (input.allowlist !== undefined) {
    const parsed = parseAllowlist(input.allowlist);
    if (!parsed) return { ok: false, error: 'invalid_allowlist' };
    nextAllowlist = parsed;
  }

  const loaded = await readOverrideMap();
  if (!loaded.ok) return loaded;

  const existing = loaded.byKey.get(entry.key);
  const prev: FlagOverride = existing?.override ?? {
    percent: entry.defaultPercent,
    killed: false,
    allowlist: [],
  };

  const next: FlagOverride = {
    percent: input.percent !== undefined ? clampPercent(input.percent) : prev.percent,
    killed: input.killed !== undefined ? input.killed : prev.killed,
    allowlist: nextAllowlist ?? prev.allowlist,
  };

  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, error: 'no_service_role' };

  const updatedAt = new Date().toISOString();
  const { error: upsertError } = await admin.from('feature_flag_overrides').upsert(
    {
      flag_key: entry.key,
      percent: next.percent,
      killed: next.killed,
      allowlist: next.allowlist,
      updated_at: updatedAt,
      updated_by: input.actor,
    },
    { onConflict: 'flag_key' }
  );

  if (upsertError) {
    if (isMissingRelation(upsertError)) return { ok: false, error: 'unavailable' };
    console.error('[flags] override write failed');
    return { ok: false, error: 'query_failed' };
  }

  const events: { kind: FlagEventKind; payload: unknown }[] = [];
  if (input.percent !== undefined && next.percent !== prev.percent) {
    events.push({ kind: 'percent', payload: { percent: next.percent } });
  }
  if (input.killed !== undefined && next.killed !== prev.killed) {
    events.push({ kind: next.killed ? 'kill' : 'unkill', payload: {} });
  }
  if (nextAllowlist !== undefined) {
    events.push({ kind: 'allowlist', payload: { allowlist: next.allowlist } });
  }

  for (const event of events) {
    const { error: eventError } = await admin.from('feature_flag_events').insert({
      flag_key: entry.key,
      kind: event.kind,
      payload: event.payload,
      actor: input.actor,
    });
    if (eventError) {
      if (isMissingRelation(eventError)) return { ok: false, error: 'unavailable' };
      console.error('[flags] event write failed');
      return { ok: false, error: 'query_failed' };
    }
  }

  return {
    ok: true,
    flag: catalogRow(entry, next, { updatedAt, updatedBy: input.actor }),
  };
}
