/** Opaque ack. The database's own text stays on the server log. */
export const SYNC_FAILED = 'sync_failed';

export function logSyncFailure(scope: string, detail: string): typeof SYNC_FAILED {
  console.error('[%s] %s', scope, detail);
  return SYNC_FAILED;
}

export function logSyncThrown(scope: string, thrown: unknown): typeof SYNC_FAILED {
  const detail = thrown instanceof Error ? thrown.message : 'upsert failed';
  return logSyncFailure(scope, detail);
}
