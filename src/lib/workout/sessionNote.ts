/**
 * Private session notes (`.982`).
 *
 * One optional diary field on the live session and the close receipt.
 * Strong-style: add notes if you have more to record. Empty invents nothing.
 * Stored with the session on this device. Not a Feed. Not DMs. Not a public URL.
 */

export const SESSION_NOTE_MAX = 500;

/**
 * Boundary parse. Empty / whitespace / non-string → `undefined`.
 * Over-cap is truncated — never padded, never invented from volume or vs-last.
 */
export function normalizeSessionNote(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > SESSION_NOTE_MAX ? trimmed.slice(0, SESSION_NOTE_MAX) : trimmed;
}

/**
 * Copy a kept note onto a completed log. Empty / whitespace omit the field.
 * Clearing drops `sessionNote` so the log stays sparse.
 */
export function attachSessionNote<T extends object>(log: T, note: unknown): T {
  const kept = normalizeSessionNote(note);
  const current = log as T & { sessionNote?: string };
  if (!kept) {
    if (!('sessionNote' in current) || current.sessionNote === undefined) return log;
    const { sessionNote: _drop, ...rest } = current;
    return rest as T;
  }
  return { ...log, sessionNote: kept };
}

/**
 * Cloud rows never carry this field. If merge picks a cloud winner, keep the
 * local diary when the winner has none. Empty invents nothing.
 */
export function preserveSessionNote<T extends object>(winner: T, other: T): T {
  const win = winner as T & { sessionNote?: string };
  const alt = other as T & { sessionNote?: string };
  if (normalizeSessionNote(win.sessionNote)) return winner;
  const kept = normalizeSessionNote(alt.sessionNote);
  return kept ? { ...winner, sessionNote: kept } : winner;
}
