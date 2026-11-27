import { z } from 'zod';

const timestamp = z.string().datetime({ offset: true });
const rowId = z.string().uuid();

export function parseMobileSyncCursor(raw: string | null) {
  const [updatedAt, id, extra] = (raw ?? '1970-01-01T00:00:00.000Z').split('~');
  if (extra !== undefined || !timestamp.safeParse(updatedAt).success ||
    (id !== undefined && !rowId.safeParse(id).success)) return null;
  return { updatedAt, id };
}

export function mobileSyncCursorFilter(updatedAt: string, id: string): string {
  return `updated_at.gt.${updatedAt},and(updated_at.eq.${updatedAt},id.gt.${id})`;
}

export function nextMobileSyncCursor(
  rows: readonly { updated_at: string; id: string }[],
  limit: number,
  composite: boolean,
): string | null {
  const last = rows.at(-1);
  if (rows.length !== limit || !last) return null;
  return composite ? `${last.updated_at}~${last.id}` : last.updated_at;
}
