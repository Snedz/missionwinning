/**
 * Reorder this exercise once, this session (`.998`).
 *
 * Active list only. Does not write the Coach plan, saved routines,
 * or Wednesday. Empty / same / missing index invents nothing.
 */

export function reorderSessionExercises<T>(
  exercises: readonly T[],
  fromIndex: number,
  toIndex: number
): T[] | null {
  if (!exercises.length) return null;
  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) return null;
  if (fromIndex === toIndex) return null;
  if (fromIndex < 0 || toIndex < 0) return null;
  if (fromIndex >= exercises.length || toIndex >= exercises.length) return null;
  const next = exercises.slice();
  const [moved] = next.splice(fromIndex, 1);
  if (moved === undefined) return null;
  next.splice(toIndex, 0, moved);
  return next;
}
