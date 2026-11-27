import type { CompletedWorkoutLog } from '@/types';
import { incomingWorkoutBeats, mapCloudToLocal, workoutFingerprint } from '@/lib/workout/workoutMerge';

export type WorkoutCloudRow = Parameters<typeof mapCloudToLocal>[0][number] & {
  id: string;
  user_id: string;
  client_id: string | null;
  revision: number;
  updated_at: string;
  deleted_at: string | null;
  weight_unit: 'kg' | 'lb';
  set_count: number;
};

type WorkoutWrite = Omit<WorkoutCloudRow, 'id'>;

const COLUMNS = 'id,user_id,client_id,revision,updated_at,deleted_at,workout_name,started_at,completed_at,duration_seconds,exercises,total_volume,weight_unit,set_count';
const PAGE_SIZE = 200;
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export function cloudRowId(log: CompletedWorkoutLog): string | null {
  const id = log.id.startsWith('cloud-') ? log.id.slice(6) : '';
  return uuid.test(id) ? id : null;
}

function exactLegacyKey(log: CompletedWorkoutLog) {
  return JSON.stringify([log.workoutName, Date.parse(log.startedAt), Date.parse(log.completedAt)]);
}

export function alignLegacyWorkouts(local: CompletedWorkoutLog[], cloud: CompletedWorkoutLog[]) {
  const knownClients = new Set(cloud.map((log) => log.clientId).filter(Boolean));
  const legacy = new Map<string, CompletedWorkoutLog | null>();
  for (const log of cloud) {
    if (log.clientId) continue;
    const key = exactLegacyKey(log);
    legacy.set(key, legacy.has(key) ? null : log);
  }
  return local.map((log) => {
    const match = !cloudRowId(log) && !knownClients.has(log.clientId) && legacy.get(exactLegacyKey(log));
    return match && workoutFingerprint(match) === workoutFingerprint(log)
      ? { ...log, id: match.id, clientId: undefined } : log;
  });
}

export function workoutIsAhead(log: CompletedWorkoutLog, remote: WorkoutCloudRow) {
  const revision = log.revision ?? 1;
  if (!incomingWorkoutBeats({
    incomingRevision: revision, serverRevision: remote.revision,
    incomingDeleted: !!log.deletedAt, serverDeleted: !!remote.deleted_at,
  })) return false;
  return revision !== remote.revision || !!log.deletedAt !== !!remote.deleted_at ||
    Date.parse(log.updatedAt ?? log.completedAt) > Date.parse(remote.updated_at);
}

/** Stable after a reload or repeated import; preserve every valid original UUID. */
export async function withClientId(log: CompletedWorkoutLog): Promise<CompletedWorkoutLog> {
  if (cloudRowId(log) || uuid.test(log.clientId ?? '')) return log;
  const source = log.clientId ?? (log.id || workoutFingerprint(log));
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`mission-winning:workout:${source}`))).slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x80;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  const clientId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  return { ...log, clientId };
}

export function createWorkoutCloud(input: {
  url: string;
  publicKey: string;
  userId: string;
  accessToken: string;
  fetcher?: typeof fetch;
}) {
  const fetcher = input.fetcher ?? fetch;
  const url = new URL('/rest/v1/workout_logs', input.url);

  function request(method: string, filters: Record<string, string>, row?: Partial<WorkoutWrite>) {
    const target = new URL(url);
    target.search = new URLSearchParams({
      select: COLUMNS,
      user_id: `eq.${input.userId}`,
      ...filters,
    }).toString();
    const headers = {
      apikey: input.publicKey,
      authorization: `Bearer ${input.accessToken}`,
      'content-type': 'application/json',
      prefer: 'return=representation',
    };
    return fetcher(target, { method, headers, cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
      ...(row ? { body: JSON.stringify(row) } : {}),
    });
  }

  async function rows(response: Response): Promise<WorkoutCloudRow[]> {
    if (!response.ok) throw new Error(`Workout sync unavailable (${response.status}).`);
    const body: unknown = await response.json();
    if (!Array.isArray(body) || body.some((row) =>
      !row || row.user_id !== input.userId || !uuid.test(row.id))) {
      throw new Error('Workout sync returned unexpected data.');
    }
    return body;
  }

  async function pull(): Promise<WorkoutCloudRow[]> {
    const result: WorkoutCloudRow[] = [];
    let after: string | undefined;
    while (true) {
      const page = await rows(await request('GET', {
        order: 'id.asc', limit: String(PAGE_SIZE), ...(after ? { id: `gt.${after}` } : {}),
      }));
      if (!page.length) return result;
      const next = page[page.length - 1].id;
      if (after && next <= after) throw new Error('Workout pagination did not advance.');
      result.push(...page);
      after = next;
      if (page.length < PAGE_SIZE) return result;
    }
  }

  async function push(log: CompletedWorkoutLog, weightUnit: 'kg' | 'lb'): Promise<boolean> {
    const id = cloudRowId(log);
    const clientId = uuid.test(log.clientId ?? '') ? log.clientId! : null;
    if (!id && !clientId) return false;
    const match: Record<string, string> = id ? { id: `eq.${id}` } : { client_id: `eq.${clientId}` };
    let [existing] = await rows(await request('GET', { ...match, limit: '1' }));
    if (!existing && !id) {
      const candidates = await rows(await request('GET', {
        client_id: 'is.null', completed_at: `eq.${log.completedAt}`,
        started_at: `eq.${log.startedAt}`, limit: '10',
      }));
      const same = candidates.filter((candidate) => workoutFingerprint(mapCloudToLocal([candidate])[0]) === workoutFingerprint(log));
      if (same.length === 1) [existing] = same;
    }
    if (existing && !workoutIsAhead(log, existing)) return true;
    if (!existing && id) return true; // do not recreate hard-deleted server rows
    const row: WorkoutWrite = {
      user_id: input.userId, client_id: existing ? existing.client_id : clientId, revision: log.revision ?? 1,
      updated_at: new Date(Math.max(Date.now(), Date.parse(log.updatedAt ?? log.completedAt))).toISOString(),
      deleted_at: log.deletedAt ?? null, workout_name: log.workoutName,
      started_at: log.startedAt, completed_at: log.completedAt, duration_seconds: log.durationSeconds,
      total_volume: log.totalVolume, exercises: log.exercises,
      weight_unit: existing?.weight_unit ?? weightUnit,
      set_count: log.exercises.reduce((count, exercise) => count + exercise.sets.length, 0),
    };
    if (!existing) {
      const response = await request('POST', {}, row);
      if (response.status === 409) return false; // re-read the winning revision on the next try
      return (await rows(response)).length === 1;
    }
    return (await rows(await request('PATCH', {
      id: `eq.${existing.id}`, revision: `eq.${existing.revision}`,
      updated_at: `eq.${existing.updated_at}`,
      deleted_at: existing.deleted_at ? `eq.${existing.deleted_at}` : 'is.null',
    }, log.deletedAt ? { revision: row.revision, updated_at: row.updated_at, deleted_at: row.deleted_at } : row))).length === 1;
  }

  return { pull, push };
}
