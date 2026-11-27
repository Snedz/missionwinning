import { z } from 'zod';

const timestamp = z.string().datetime({ offset: true });
const uuid = z.string().uuid();

export function parseSyncCursor(raw: string | null) {
  if (raw === null) return { updatedAt: '1970-01-01T00:00:00.000Z', id: null };
  const [updatedAt, id, extra] = raw.split('~');
  if (extra !== undefined || !timestamp.safeParse(updatedAt).success ||
      (id !== undefined && !uuid.safeParse(id).success)) return null;
  return { updatedAt, id: id ?? null };
}

export function syncCursorFilter(cursor: { updatedAt: string; id: string }) {
  const { updatedAt, id } = cursor;
  return `updated_at.gt.${updatedAt},and(updated_at.eq.${updatedAt},id.gt.${id})`;
}

export function nextSyncCursor(rows: { updated_at: string; id: string }[], limit: number) {
  const last = rows.at(-1);
  return rows.length === limit && last ? `${last.updated_at}~${last.id}` : null;
}
